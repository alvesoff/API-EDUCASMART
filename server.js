const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Conectar ao MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json({ extended: false, limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Configuração do CORS para permitir requisições do frontend
app.use(cors({
  origin: ['https://frontend-one-kappa-88.vercel.app', 'https://frontend-pys4p8cyp-alvesoffs-projects.vercel.app', process.env.CORS_ORIGIN],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Definir rotas
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/provas', require('./routes/provas'));
app.use('/api/resultados', require('./routes/resultados'));
app.use('/api/questoes-pessoais', require('./routes/questoesPessoais'));

// Rota padrão
app.get('/api', (req, res) => {
  res.json({ msg: 'Bem-vindo à API do EducaSmart' });
});

// Porta do servidor
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});