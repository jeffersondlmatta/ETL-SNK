// src/gateway.js
import axios from "axios";
import { getAccessToken } from "./auth.js";

const GATEWAY_URL = process.env.GATEWAY_URL ?? "https://api.sandbox.sankhya.com.br/gateway/v1/mge/service.sbr?outputType=json";
const API_TIMEOUT_MS = 60000;

/**
 * Chama o CRUDServiceProvider.loadRecords via Gateway (POST).
 * Aceita um objeto dataSet e injeta o Bearer automaticamente.
 */
export async function loadRecords(dataSet) {
  const token = await getAccessToken();

  const url = `${GATEWAY_URL}&serviceName=${encodeURIComponent("CRUDServiceProvider.loadRecords")}`;
  const payload = { requestBody: { dataSet } };

  const { data } = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    timeout: API_TIMEOUT_MS
  });

  if (data?.error?.codigo) {
    const e = new Error(`${data.error.codigo} - ${data.error.descricao || "Erro no Gateway"}`);
    e.code = data.error.codigo;
    throw e;
  }
  return data;
}

/**
 * Helper de paginação: itera offsetPage "0","1","2"... e agrega resultados.
 * getPageRecords: função que, dado o JSON da Sankhya, devolve o array de registros.
 */
export async function loadRecordsAllPages(baseDataSet, getPageRecords) {
  const all = [];
  let page = 0;

  // alguns ambientes exigem offsetPage string
  while (true) {
    const ds = { ...baseDataSet, offsetPage: String(page) };
    const resp = await loadRecords(ds);
    const rows = getPageRecords(resp) || [];
    all.push(...rows);

    // critério simples de parada:
    // - se não veio nada
    // - ou se vier um paginate/flag indicando fim (ajuste conforme a sua resposta)
    if (!rows.length) break;

    page += 1;
    // TODO: se sua resposta trouxer totalPages/hasMoreResult, troque a condição acima
  }
  return all;
}
