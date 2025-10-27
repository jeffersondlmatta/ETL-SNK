// src/index.js
import { loadRecords, loadRecordsAllPages } from "./gateway.js";
import { dataSetFinanceiro } from "./payloads/financeiro.js";
// import { dataSetParceiroCliente } from "./payloads/parceiro.js";

async function main() {
  try {
    // Financeiro - títulos a receber (RECDESP=1), empresa 1
    const ds = dataSetFinanceiro({ codeEmp: 20, recDesp: 1 });

    // Buscar apenas a 1ª página (até 100 reg, conforme pageSize)
    const firstPage = await loadRecords(ds);
    console.dir(firstPage, { depth: null });
  } catch (err) {
    console.error("Falha:", err?.response?.data || err.message);
  }
}
main();
