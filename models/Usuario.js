const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  senha: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['aluno', 'professor', 'admin'],
    required: true
  },
  turma: {
    type: String,
    required: function() {
      return this.tipo === 'aluno';
    }
  },
  serie: {
    type: String,
    required: function() {
      return this.tipo === 'aluno';
    }
  },
  disciplinas: [{
    type: String
  }],
  ativo: {
    type: Boolean,
    default: true
  },
  resetToken: String,
  resetTokenExpiracao: Date
}, {
  timestamps: true
});

// Método para comparar senha
UsuarioSchema.methods.matchPassword = async function(senhaDigitada) {
  return await bcrypt.compare(senhaDigitada, this.senha);
};

// Middleware para criptografar senha antes de salvar
UsuarioSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
});

module.exports = mongoose.model('Usuario', UsuarioSchema);