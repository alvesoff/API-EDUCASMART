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

const QuestaoPessoalSchema = new mongoose.Schema({
  professor: {
    type: String,
    required: true
  },
  enunciado: {
    type: String,
    required: true
  },
  imagem: {
    type: String // Armazenará a imagem em formato base64
  },
  alternativas: [AlternativaSchema],
  dificuldade: {
    type: String,
    enum: ['FÁCIL', 'PADRÃO', 'DIFÍCIL'],
    default: 'PADRÃO'
  },
  serie: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QuestaoPessoal', QuestaoPessoalSchema);