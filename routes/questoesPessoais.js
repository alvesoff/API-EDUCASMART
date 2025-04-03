const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const questoesPessoaisController = require('../controllers/questoesPessoais');
const professorAuth = require('../middleware/professorAuth');

// @route   POST /api/questoes-pessoais
// @desc    Criar uma nova questão pessoal
// @access  Private (Professor)
router.post(
  '/',
  [
    check('enunciado', 'Enunciado é obrigatório').not().isEmpty(),
    check('alternativas', 'A questão deve ter alternativas').isArray({ min: 2 }),
    check('alternativas.*.texto', 'Texto da alternativa é obrigatório').not().isEmpty(),
    check('alternativas.*.correta', 'Indicador de alternativa correta é obrigatório').isBoolean()
  ],
  (req, res, next) => {
    // Permitir criação de questões sem autenticação
    next();
  },
  questoesPessoaisController.criarQuestaoPessoal
);

// @route   GET /api/questoes-pessoais
// @desc    Obter todas as questões pessoais de um professor
// @access  Private (Professor)
router.get('/', professorAuth, questoesPessoaisController.getQuestoesPessoaisProfessor);

// @route   GET /api/questoes-pessoais/:id
// @desc    Obter uma questão pessoal por ID
// @access  Private (Professor)
router.get('/:id', professorAuth, questoesPessoaisController.getQuestaoPessoalPorId);

// @route   PUT /api/questoes-pessoais/:id
// @desc    Atualizar uma questão pessoal
// @access  Private (Professor)
router.put(
  '/:id',
  [
    professorAuth,
    check('enunciado', 'Enunciado é obrigatório').optional().not().isEmpty(),
    check('alternativas', 'A questão deve ter alternativas').optional().isArray({ min: 2 }),
    check('alternativas.*.texto', 'Texto da alternativa é obrigatório').optional().not().isEmpty(),
    check('alternativas.*.correta', 'Indicador de alternativa correta é obrigatório').optional().isBoolean(),
    check('professor', 'ID do professor é obrigatório').not().isEmpty()
  ],
  questoesPessoaisController.atualizarQuestaoPessoal
);

// @route   DELETE /api/questoes-pessoais/:id
// @desc    Excluir uma questão pessoal
// @access  Private (Professor)
router.delete('/:id', professorAuth, questoesPessoaisController.excluirQuestaoPessoal);

module.exports = router;