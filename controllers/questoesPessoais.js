const QuestaoPessoal = require('../models/QuestaoPessoal');
const { validationResult } = require('express-validator');

// @desc    Criar uma nova questão pessoal
// @route   POST /api/questoes-pessoais
// @access  Private (Professor)
exports.criarQuestaoPessoal = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { enunciado, alternativas, dificuldade, serie, professor = null, imagem } = req.body;

    // Criar nova questão pessoal
    const questaoPessoal = new QuestaoPessoal({
      professor,
      enunciado,
      alternativas,
      dificuldade,
      serie,
      imagem // Armazenar a imagem em formato base64
    });

    await questaoPessoal.save();

    res.status(201).json({
      success: true,
      data: questaoPessoal
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Obter todas as questões pessoais de um professor
// @route   GET /api/questoes-pessoais
// @access  Private (Professor)
exports.getQuestoesPessoaisProfessor = async (req, res) => {
  try {
    const { professor } = req.query;
    if (!professor) {
      return res.status(400).json({ msg: 'ID do professor é obrigatório' });
    }
    const questoesPessoais = await QuestaoPessoal.find({ professor })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: questoesPessoais.length,
      data: questoesPessoais
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Obter uma questão pessoal por ID
// @route   GET /api/questoes-pessoais/:id
// @access  Private (Professor)
exports.getQuestaoPessoalPorId = async (req, res) => {
  try {
    const questaoPessoal = await QuestaoPessoal.findById(req.params.id);

    if (!questaoPessoal) {
      return res.status(404).json({ msg: 'Questão pessoal não encontrada' });
    }

    res.json({
      success: true,
      data: questaoPessoal
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Questão pessoal não encontrada' });
    }
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Atualizar uma questão pessoal
// @route   PUT /api/questoes-pessoais/:id
// @access  Private (Professor)
exports.atualizarQuestaoPessoal = async (req, res) => {
  try {
    const { enunciado, alternativas, dificuldade, serie, imagem } = req.body;

    // Construir objeto de atualização
    const camposAtualizacao = {};
    if (enunciado) camposAtualizacao.enunciado = enunciado;
    if (alternativas) camposAtualizacao.alternativas = alternativas;
    if (dificuldade) camposAtualizacao.dificuldade = dificuldade;
    if (serie) camposAtualizacao.serie = serie;
    if (imagem) camposAtualizacao.imagem = imagem;

    // Verificar se a questão existe
    let questaoPessoal = await QuestaoPessoal.findById(req.params.id);

    if (!questaoPessoal) {
      return res.status(404).json({ msg: 'Questão pessoal não encontrada' });
    }

    // Verificar se o professor é o dono da questão
    if (questaoPessoal.professor.toString() !== req.body.professor) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }

    // Atualizar questão
    questaoPessoal = await QuestaoPessoal.findByIdAndUpdate(
      req.params.id,
      { $set: camposAtualizacao },
      { new: true }
    );

    res.json({
      success: true,
      data: questaoPessoal
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Questão pessoal não encontrada' });
    }
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Excluir uma questão pessoal
// @route   DELETE /api/questoes-pessoais/:id
// @access  Private (Professor)
exports.excluirQuestaoPessoal = async (req, res) => {
  try {
    // Verificar se a questão existe
    const questaoPessoal = await QuestaoPessoal.findById(req.params.id);

    if (!questaoPessoal) {
      return res.status(404).json({ msg: 'Questão pessoal não encontrada' });
    }

    // Verificar se o professor é o dono da questão
    if (questaoPessoal.professor.toString() !== req.body.professor) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }

    // Excluir questão
    await questaoPessoal.remove();

    res.json({ msg: 'Questão pessoal removida' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Questão pessoal não encontrada' });
    }
    res.status(500).send('Erro no servidor');
  }
};