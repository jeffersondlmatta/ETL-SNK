# 🧾 ETL Financeiro Sankhya

Este projeto realiza a **extração, transformação e carga (ETL)** de títulos financeiros da API Sankhya para um banco de dados **PostgreSQL**, consolidando informações de múltiplas empresas em um único repositório para análise e dashboards.

---

## 🎯 Objetivo

Automatizar a integração diária com a API do **Sankhya** para:
- Extrair títulos financeiros (abertos, pagos e atrasados);
- Filtrar somente **receitas válidas** (descrição iniciando com "Receita");
- Persistir os dados limpos e normalizados em um banco **PostgreSQL**;
- Servir de base para dashboards financeiros e BI.

---

## 🏗️ Estrutura do Projeto


---

## ⚙️ Tecnologias Utilizadas

- **Node.js** (ESM)
- **PostgreSQL** com `pg` (Pool de conexões)
- **dotenv** para variáveis de ambiente
- **Axios** (via `gateway.js`, comunicação com API Sankhya)
- **API Sankhya - endpoint loadRecords**

---

## 🔐 Regras de Negócio

Durante a carga no banco:
1. Só são gravados registros com:
   - `nufin` válido  
   - `numnota` diferente de 0  
   - `descr_natureza` iniciando com “receita” (case-insensitive, com trim)
2. O status é calculado automaticamente:
   - `pago` → se há `dhBaixa`
   - `atrasado` → se vencido e não pago
   - `a vencer` → se futuro e não pago

---

## 🧰 Configuração do Ambiente

### 1. Pré-requisitos
- Node.js v18+
- PostgreSQL
- Credenciais de integração da API Sankhya (client_id e client_secret)

### 2. Instalação

```bash
git clone https://github.com/seuusuario/etl-financeiro-sankhya.git
cd etl-financeiro-sankhya
npm install


▶️ Execução
Rodar manualmente (modo único)
node src/index.js
Rodar em modo de desenvolvimento (com auto reload)
npm run dev


Estrutura da Tabela no Banco
CREATE TABLE IF NOT EXISTS titulos_financeiros (
  nufin           BIGINT PRIMARY KEY,
  nome_empresa    TEXT,
  nome_parceiro   TEXT,
  descr_natureza  TEXT,
  numnota         BIGINT,
  valor_desdobra  NUMERIC(15,2),
  dt_vencimento   DATE,
  dt_baixa        TIMESTAMP,
  codemp          INT,
  codparc         INT,
  status          TEXT,
  situacao        TEXT
);
