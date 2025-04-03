const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const provasController = require('../controllers/provas');
const auth = require('../middleware/auth');
const professorAuth = require('../middleware/professorAuth');

// @route   POST /api/provas
// @desc    Criar uma nova prova
// @access  Private (Professor)
router.post(
  '/',
  [
    check('titulo', 'Título é obrigatório').not().isEmpty().trim().isLength({ min: 3 }),
    check('disciplina').optional().trim(),
    check('serie', 'Série é obrigatória').not().isEmpty().trim(),
    check('turmas', 'Turmas são obrigatórias').isArray({ min: 1 }).withMessage('Deve ter pelo menos 1 turma'),
    check('dataInicio', 'Data de início é obrigatória').isISO8601().toDate(),
    check('dataFim', 'Data de fim é obrigatória').isISO8601().toDate().custom((value, { req }) => value > req.body.dataInicio).withMessage('Data fim deve ser após data início'),
    check('professor', 'ID do professor é obrigatório').not().isEmpty().isMongoId(),
    check('questoes', 'A prova deve ter pelo menos 1 questão').isArray({ min: 1 }),
    check('status', 'Status inválido').optional().isIn(['rascunho', 'publicada', 'encerrada'])
  ],
  provasController.criarProva
);

// @route   GET /api/provas
// @desc    Obter todas as provas de um professor
// @access  Private (Professor)
router.get('/', provasController.getProvasProfessor);

// @route   GET /api/provas/aluno
// @desc    Obter provas disponíveis para um aluno
// @access  Private (Aluno)
router.get('/aluno', auth, provasController.getProvasAluno);

// @route   GET /api/provas/codigo/:codigo
// @desc    Obter uma prova pelo código (rota antiga)
// @access  Public
router.get('/codigo/:codigo', provasController.getProvaPorCodigo);

// @route   GET /api/provas/:codigo
// @desc    Obter uma prova pelo código (nova rota)
// @access  Public
router.get('/:codigo', provasController.getProvaPorCodigo);

// @route   GET /api/provas/:id
// @desc    Obter uma prova por ID
// @access  Private (Professor/Aluno)
router.get('/:id', auth, provasController.getProvaPorId);

// @route   PUT /api/provas/:id
// @desc    Atualizar uma prova
// @access  Private (Professor)
router.put(
  '/:id',
  [
    professorAuth,
    check('titulo', 'Título é obrigatório').optional().not().isEmpty(),
    check('disciplina').optional(),
    check('serie', 'Série é obrigatória').optional().not().isEmpty(),
    check('turmas', 'Turmas são obrigatórias').optional().isArray().not().isEmpty(),
    check('dataInicio', 'Data de início é obrigatória').optional().isISO8601(),
    check('dataFim', 'Data de fim é obrigatória').optional().isISO8601(),
    check('status', 'Status inválido').optional().isIn(['rascunho', 'publicada', 'encerrada'])
  ],
  provasController.atualizarProva
);

// @route   DELETE /api/provas/:id
// @desc    Excluir uma prova
// @access  Private (Professor)
router.delete('/:id', professorAuth, provasController.excluirProva);

// @route   PUT /api/provas/:id/publicar
// @desc    Publicar uma prova
// @access  Private (Professor)
router.put('/:id/publicar', professorAuth, provasController.publicarProva);

// @route   PUT /api/provas/:id/encerrar
// @desc    Encerrar uma prova
// @access  Private (Professor)
router.put('/:id/encerrar', professorAuth, provasController.encerrarProva);

module.exports = router;