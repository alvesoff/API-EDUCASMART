const mongoose = require('mongoose');

const RespostaSchema = new mongoose.Schema({
  questao: {
    type: Number,
    required: true
  },
  alternativaSelecionada: {
    type: Number,
    required: true
  },
  correta: {
    type: Boolean,
    required: true
  },
  pontuacao: {
    type: Number,
    required: true
  }
});

const ResultadoSchema = new mongoose.Schema({
  aluno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: false
  },
  nomeAluno: {
    type: String,
    required: function() {
      return !this.aluno;
    }
  },
  turma: {
    type: String,
    required: function() {
      return !this.aluno;
    }
  },
  codigoProva: {
    type: String,
    required: function() {
      return !this.aluno;
    }
  },
  status: {
    type: String,
    enum: ['iniciado', 'em_andamento', 'finalizado', 'cancelado'],
    default: 'iniciado'
  },
  prova: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prova',
    required: true
  },
  respostas: [RespostaSchema],
  pontuacaoTotal: {
    type: Number,
    default: 0
  },
  percentualAcerto: {
    type: Number,
    default: 0
  },
  tempoGasto: {
    type: Number,
    default: 0
  },
  dataInicio: {
    type: Date,
    required: true
  },
  dataFim: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resultado', ResultadoSchema);