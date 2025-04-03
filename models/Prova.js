const mongoose = require('mongoose');

const AlternativaSchema = new mongoose.Schema({
  texto: {
    type: String,
    required: true
  },
  correta: {
    type: Boolean,
    default: false
  }
});

const QuestaoSchema = new mongoose.Schema({
  enunciado: {
    type: String,
    required: true
  },
  imagem: {
    type: String
  },
  alternativas: [AlternativaSchema],
  pontuacao: {
    type: Number,
    default: 1
  },
  dificuldade: {
    type: String,
    enum: ['FÁCIL', 'PADRÃO', 'DIFÍCIL'],
    default: 'PADRÃO'
  },
  serie: {
    type: String
  }
});

const ProvaSchema = new mongoose.Schema({
  professor: {
    type: String,
    required: true
  },
  titulo: {
    type: String,
    required: true
  },
  disciplina: {
    type: String,
    required: false
  },
  serie: {
    type: String,
    required: true
  },
  turmas: [{
    type: String,
    required: true
  }],
  questoes: [QuestaoSchema],
  dataInicio: {
    type: Date,
    required: true
  },
  dataFim: {
    type: Date,
    required: true
  },
  duracao: {
    type: Number,
    default: 60 // duração em minutos
  },
  status: {
    type: String,
    enum: ['rascunho', 'publicada', 'encerrada'],
    default: 'rascunho'
  },
  codigoProva: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Prova', ProvaSchema);