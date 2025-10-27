
    export function dataSetFinanceiro({ codeEmp, recDesp /* 1=Receber, 2=Pagar */ }) {
    const parts = [];
    const params = [];

    if (codeEmp != null) {
        parts.push("CODEMP = ?");
        params.push({ $: String(codeEmp), type: "I" });
    }
    if (recDesp != null) {
        parts.push("RECDESP = ?");
        params.push({ $: String(recDesp), type: "I" });
    }

    const expression = parts.length ? parts.join(" AND ") : "1=1";

    return {
        rootEntity: "Financeiro",
        includePresentationFields: "N",
        tryJoinedFields: "true",
        offsetPage: "0",           // primeira página
        pageSize: "20",           // limite de 100 registros (ou o máximo suportado)
        criteria: {
        expression: { $: expression },
        parameter: params
        },
        entity: [
        {
            path: "",
            fieldset: {
            list: [
                "NUFIN",
                "CODPARC",
                "CODEMP",
                "NUMNOTA",
                "VLRDESDOB",
                "RECDESP"
            ].join(",")
            }
        },
        { path: "Parceiro", fieldset: { list: "NOMEPARC" } },
        { path: "Empresa",  fieldset: { list: "NOMEFANTASIA" } }
        ]
    };
    }
