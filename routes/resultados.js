const express = require('express');
const router = express.Router();
const Resultado = require('../models/Resultado');
const { check, validationResult } = require('express-validator');

// @route   POST /api/resultados/registrar-acesso
// @desc    Registrar acesso do aluno à prova
// @access  Public
router.post('/registrar-acesso', [
  check('nomeAluno', 'Nome do aluno é obrigatório').not().isEmpty(),
  check('turma', 'Turma é obrigatória').not().isEmpty(),
  check('codigoProva', 'Código da prova é obrigatório').not().isEmpty(),
  check('idProva', 'ID da prova é obrigatório').not().isEmpty(),
  check('dataAcesso', 'Data de acesso é obrigatória').not().isEmpty(),
  check('status', 'Status é obrigatório').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { nomeAluno, turma, codigoProva, idProva, dataAcesso, status } = req.body;

    // Criar novo registro de acesso
    const novoAcesso = new Resultado({
      nomeAluno,
      turma,
      codigoProva,
      prova: idProva,
      dataInicio: dataAcesso,
      status
    });

    // Salvar no banco de dados
    const resultado = await novoAcesso.save();

    res.status(201).json({ success: true, resultado });
  } catch (err) {
    console.error('Erro ao registrar acesso:', err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

const resultadosController = require('../controllers/resultados');
const auth = require('../middleware/auth');

// @route   POST /api/resultados/iniciar
// @desc    Iniciar realização de prova
// @access  Private (Aluno)
router.post(
  '/iniciar',
  [
    auth,
    check('provaId', 'ID da prova é obrigatório').not().isEmpty()
  ],
  resultadosController.iniciarProva
);

// @route   PUT /api/resultados/responder
// @desc    Submeter resposta de questão
// @access  Private (Aluno)
router.put(
  '/responder',
  [
    auth,
    check('resultadoId', 'ID do resultado é obrigatório').not().isEmpty(),
    check('questaoIndex', 'Índice da questão é obrigatório').isNumeric(),
    check('alternativaIndex', 'Índice da alternativa é obrigatório').isNumeric()
  ],
  resultadosController.responderQuestao
);

// @route   PUT /api/resultados/finalizar
// @desc    Finalizar prova
// @access  Public
router.put(
  '/finalizar',
  [
    check('resultadoId', 'ID do resultado é obrigatório').not().isEmpty()
  ],
  resultadosController.finalizarProva
);

// @route   GET /api/resultados
// @desc    Listar todos os resultados
// @access  Private (Admin/Professor)
router.get('/', auth, resultadosController.getAllResultados);

// @route   GET /api/resultados/aluno/:alunoId
// @desc    Listar resultados de um aluno
// @access  Private (Aluno/Professor)
router.get('/aluno/:alunoId', auth, resultadosController.getResultadosPorAluno);

// @route   GET /api/resultados/prova/:provaId
// @desc    Listar resultados de uma prova
// @access  Private (Professor)
router.get('/prova/:provaId', auth, resultadosController.getResultadosPorProva);

// @route   GET /api/resultados/estatisticas/:provaId
// @desc    Obter estatísticas de uma prova
// @access  Private (Professor)
router.get('/estatisticas/:provaId', auth, resultadosController.getEstatisticasProva);

// @route   GET /api/resultados/codigo/:codigoProva
// @desc    Buscar resultados pelo código da prova
// @access  Private (Admin/Professor)
router.get('/codigo/:codigoProva', auth, resultadosController.getResultadosPorCodigoProva);

// @route   GET /api/resultados/estatisticas/avancadas
// @desc    Obter estatísticas avançadas para dashboard
// @access  Private (Admin/Professor)
router.get('/estatisticas/avancadas', auth, resultadosController.getEstatisticasAvancadas);

// @route   GET /api/resultados/:id
// @desc    Obter resultado de uma prova
// @access  Private (Aluno/Professor)
router.get('/:id', auth, resultadosController.getResultado);

module.exports = router;