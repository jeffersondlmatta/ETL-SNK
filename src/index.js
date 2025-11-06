// src/index.js
import { loadRecords } from "./gateway.js";
import { dataSetTodasEmpresas6m } from "./payloads/financeiro.js";
import { carregarTitulosNoBanco } from "./etlFinanceiro.js";

export async function main() {
  try {
    console.log("🚀 Iniciando sincronização: todas as empresas, últimos 6 meses...");

    const base = dataSetTodasEmpresas6m();
    const pageSize = 50;
    let page = 0;
    let total = 0;

    while (true) {
      const ds = { ...base, offsetPage: String(page), pageSize: String(pageSize) };
      console.log(`🔎 Buscando página ${page}...`);

      const resp = await loadRecords(ds);
      let registros = resp?.responseBody?.entities?.entity ?? [];

      // Pode vir um objeto único, normalizamos pra array
      if (!Array.isArray(registros)) registros = registros ? [registros] : [];

      if (registros.length === 0) {
        console.log("📭 Nenhum registro retornado. Fim da carga.");
        break;
      }

      await carregarTitulosNoBanco(registros);
      total += registros.length;
      console.log(`💾 Página ${page} gravada (${registros.length}). Acumulado: ${total}`);

      // Parar se for última página
      if (registros.length < pageSize) break;
      page++;
    }

    console.log(`✅ Concluído: ${total} títulos processados e salvos no banco.`);
    return { ok: true, total };

  } catch (err) {
    console.error("❌ Falha:", err?.response?.data || err.message);
  }
}

// Executa
main();
