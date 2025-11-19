
import express from 'express';
import { main } from './src/index.js'; 

const app = express();
const port = 3000;
app.use(express.static('public'));



app.get('/financeiro', async (req, res) => {
  
  const { empresa, parceiro } = req.query;

  console.log(`[SERVER] Recebi chamada no /financeiro...`);
  console.log(`[SERVER] Filtros recebidos: Empresa=${empresa}, Parceiro=${parceiro}`);
  
  try {
    
    const dados = await main(empresa, parceiro); 
    
  
    res.send(dados); 
    
  } catch (erro) {
    
    console.error('erro ao buscar dados:', erro.message);
    res.status(500).send('Deu um problema no servidor ao buscar os dados.');
  }
});

app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}.`);
  
  // 3. ATUALIZEI A URL DE EXEMPLO
  // Agora ela mostra como você deve chamar no navegador
  console.log(`Para testar, acesse: http://localhost:3000/financeiro?empresa=20&parceiro=4914`);
});