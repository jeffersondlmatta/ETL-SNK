// src/etlFinanceiro.js
import pg from "pg";
import "dotenv/config";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Parse dd/mm/yyyy
function parseDMY(dmy) {
  if (!dmy || typeof dmy !== "string" || !dmy.includes("/")) return null;
  const [d, m, y] = dmy.split("/").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

// Calcula status
function calcStatus(DTVENC, dhBaixa) {
  if (dhBaixa) return "pago";
  if (!DTVENC) return null;
  const hoje = new Date();
  const z = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const vencZ = z(DTVENC);
  const hojeZ = z(hoje);
  if (vencZ < hojeZ) return "atrasado";
  return "a vencer";
}

// Mapeamento de campos (f0..f11)
function mapRowToDb(row) {
  const get = (i) => row[`f${i}`]?.["$"] ?? null;

  const nufin = get(0) ? Number(get(0)) : null;
  const dhBaixaStr = get(2);
  const DTVENCStr = get(3);
  const dtBaixa = parseDMY(dhBaixaStr);
  const DTVENC = parseDMY(DTVENCStr);

  let numnota = get(4) || get(7);
  const valorDesdobra = get(8) ? Number(get(8)) : null;

  const nomeEmpresa = get(9);
  const nomeParceiro = get(10);
  const descrNatureza = get(11);

  const codemp = get(6) ? Number(get(6)) : null;
  const codparc = get(5) ? Number(get(5)) : null;
  const status = calcStatus(DTVENC, dtBaixa);

  return {
    nufin,
    nome_empresa: nomeEmpresa,
    nome_parceiro: nomeParceiro,
    descr_natureza: descrNatureza,
    numnota: numnota ? Number(numnota) : null,
    valor_desdobra: valorDesdobra,
    dt_vencimento: DTVENC ? DTVENC.toISOString().slice(0, 10) : null,
    dt_baixa: dtBaixa ? dtBaixa.toISOString() : null,
    codemp,
    codparc,
    status,
    situacao: null,
  };
}

// UPSERT
async function upsertTitulo(client, t) {
  const sql = `
    INSERT INTO titulos_financeiro
      (nufin, nome_empresa, nome_parceiro, descr_natureza, numnota, valor_desdobra,
       dt_vencimento, dt_baixa, codemp, codparc, status, situacao)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    ON CONFLICT (nufin) DO UPDATE SET
      nome_empresa=EXCLUDED.nome_empresa,
      nome_parceiro=EXCLUDED.nome_parceiro,
      descr_natureza=EXCLUDED.descr_natureza,
      numnota=EXCLUDED.numnota,
      valor_desdobra=EXCLUDED.valor_desdobra,
      dt_vencimento=EXCLUDED.dt_vencimento,
      dt_baixa=EXCLUDED.dt_baixa,
      codemp=EXCLUDED.codemp,
      codparc=EXCLUDED.codparc,
      status=EXCLUDED.status,
      situacao=COALESCE(titulos_financeiro.situacao,EXCLUDED.situacao);
  `;
  const params = [
    t.nufin, t.nome_empresa, t.nome_parceiro, t.descr_natureza,
    t.numnota, t.valor_desdobra, t.dt_vencimento, t.dt_baixa,
    t.codemp, t.codparc, t.status, t.situacao
  ];
  await client.query(sql, params);
}

// Inserção em lote (com transação)
export async function carregarTitulosNoBanco(registros) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const row of registros) {
      const t = mapRowToDb(row);

      // ⚙️ Regras de filtragem:
      // 1️⃣ nufin deve existir
      // 2️⃣ numnota deve ser diferente de 0
      // 3️⃣ descr_natureza deve começar com 'receita'
      const descr = (t.descr_natureza || "").toLowerCase().trim();
      const startsWithReceita = descr.startsWith("receita");

      if (!t.nufin || !t.numnota || t.numnota === 0 || !startsWithReceita) continue;

      await upsertTitulo(client, t);
    }
    await client.query("COMMIT");
    return { ok: true, count: registros.length };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
