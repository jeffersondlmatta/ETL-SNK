
// ===================================================
// Gera dataset para todas as empresas e parceiros
// Com DTVENC entre hoje e 9 meses atrás (pagos + em aberto)
// ===================================================

export function intervaloUltimos9Meses() {
  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setMonth(inicio.getMonth() - 9);

  const fmt = (d) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return { inicioFmt: fmt(inicio), hojeFmt: fmt(hoje) };
}

export function dataSetTodasEmpresas6m() {
  const { inicioFmt, hojeFmt } = intervaloUltimos9Meses();

  return {
    rootEntity: "Financeiro",
    includePresentationFields: "S",
    tryJoinedFields: "true",
    offsetPage: "0",
    pageSize: "50", // a API retorna até 50 por página
    orderBy: { $: "DTVENC ASC" },

    criteria: {
      // ✅ todas as empresas, todos parceiros
      // ✅ pagos + abertos
      // ✅ receitas (RECDESP = 1)
      expression: { $: "RECDESP = 1 AND DTVENC >= ? AND DTVENC <= ?" },
      parameter: [
        { $: inicioFmt, type: "D" },
        { $: hojeFmt, type: "D" }
      ]
    },

    entity: [
      {
        path: "",
        fieldset: {
          list: [
            "NUFIN",     // f0
            "ATRASO",    // f1
            "DHBAIXA",   // f3
            "DTVENC",    // f2
            "NUNOTA",    // f4
            "CODPARC",   // f5
            "CODEMP",    // f6
            "NUMNOTA",   // f7
            "VLRDESDOB"  // f8
          ].join(",")
        }
      },
      { path: "Empresa", fieldset: { list: "NOMEFANTASIA" } }, // f9
      { path: "Parceiro", fieldset: { list: "NOMEPARC" } },   // f10
      { path: "Natureza", fieldset: { list: "DESCRNAT" } }    // f11
    ]
  };
}
