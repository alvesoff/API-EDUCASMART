const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

// @desc    Autenticar usuário
// @route   POST /api/usuarios/login
// @access  Public
exports.loginUsuario = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, senha } = req.body;

  try {
    let usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(400).json({ errors: [{ msg: 'Credenciais inválidas' }] });
    }

    const isMatch = await bcrypt.compare(senha, usuario.senha);

    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Credenciais inválidas' }] });
    }

    const payload = {
      usuario: {
        id: usuario.id,
        tipo: usuario.tipo
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Registrar novo usuário (admin)
// @route   POST /api/usuarios
// @access  Private (Admin)
exports.registrarUsuario = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nome, email, senha, tipo, turma, serie, disciplinas } = req.body;

  try {
    let usuario = await Usuario.findOne({ email });

    if (usuario) {
      return res.status(400).json({ errors: [{ msg: 'Usuário já existe' }] });
    }

    usuario = new Usuario({
      nome,
      email,
      senha,
      tipo,
      ...(tipo === 'aluno' && { turma, serie }),
      ...(tipo === 'professor' && { disciplinas })
    });

    await usuario.save();

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};