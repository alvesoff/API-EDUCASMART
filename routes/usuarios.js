const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// @route   POST /api/usuarios/login
// @desc    Autenticar usuário e retornar token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Por favor, inclua um email válido').isEmail(),
    check('senha', 'Senha é obrigatória').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, senha } = req.body;

    try {
      let usuario = await Usuario.findOne({ email });

      if (!usuario) {
        return res.status(400).json({ msg: 'Credenciais inválidas' });
      }

      const isMatch = await bcrypt.compare(senha, usuario.senha);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Credenciais inválidas' });
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
          res.json({ 
            token,
            usuario: {
              id: usuario.id,
              nome: usuario.nome,
              email: usuario.email,
              tipo: usuario.tipo
            }
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro no servidor');
    }
  }
);

// @route   POST /api/usuarios/registro
// @desc    Registrar um novo usuário
// @access  Public
router.post(
  '/registro',
  [
    check('nome', 'Nome é obrigatório').not().isEmpty(),
    check('email', 'Por favor, inclua um email válido').isEmail(),
    check('senha', 'Por favor, digite uma senha com 6 ou mais caracteres').isLength({ min: 6 }),
    check('tipo', 'Tipo de usuário é obrigatório').isIn(['aluno', 'professor', 'admin']),
    // Disciplinas não são mais obrigatórias para professores
    check('disciplinas').optional()
  ],
  async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, email, senha, tipo, turma, serie, disciplinas } = req.body;

    try {
      // Verificar se o usuário já existe
      let usuario = await Usuario.findOne({ email });

      if (usuario) {
        return res.status(400).json({ msg: 'Usuário já existe' });
      }

      // Criar novo usuário
      usuario = new Usuario({
        nome,
        email,
        senha,
        tipo,
        turma: tipo === 'aluno' ? turma : undefined,
        serie: tipo === 'aluno' ? serie : undefined,
        disciplinas: tipo === 'professor' ? disciplinas : undefined
      });

      // Salvar usuário no banco de dados
      await usuario.save();

      // Criar payload para JWT
      const payload = {
        user: {
          id: usuario.id,
          tipo: usuario.tipo
        }
      };

      // Gerar token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro no servidor');
    }
  }
);

// @route   POST /api/usuarios/login
// @desc    Autenticar usuário e obter token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Por favor, inclua um email válido').isEmail(),
    check('senha', 'Senha é obrigatória').exists()
  ],
  async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, senha } = req.body;

    try {
      // Verificar se o usuário existe
      let usuario = await Usuario.findOne({ email });

      if (!usuario) {
        return res.status(400).json({ msg: 'Credenciais inválidas' });
      }

      // Verificar senha
      const isMatch = await usuario.matchPassword(senha);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Credenciais inválidas' });
      }

      // Criar payload para JWT
      const payload = {
        user: {
          id: usuario.id,
          tipo: usuario.tipo
        }
      };

      // Gerar token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro no servidor');
    }
  }
);

module.exports = router;