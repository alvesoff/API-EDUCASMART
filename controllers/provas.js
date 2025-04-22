const Prova = require('../models/Prova');
const { validationResult } = require('express-validator');

// @desc    Criar uma nova prova
// @route   POST /api/provas
// @access  Private (Professor)
exports.criarProva = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { titulo, disciplina, serie, turmas, questoes, dataInicio, dataFim, duracao, professor } = req.body;

    // Verificar se o ID do professor foi fornecido
    if (!professor) {
      return res.status(400).json({ msg: 'ID do professor é obrigatório' });
    }

    // Gerar código único para a prova (formato XXXX-XXXX-XXXX)
    const gerarCodigoProva = () => {
      const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let codigo = '';
      
      // Gerar 4 caracteres + hífen + 4 caracteres + hífen + 4 caracteres
      for (let i = 0; i < 12; i++) {
        if (i === 4 || i === 8) codigo += '-';
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      
      return codigo;
    };
    
    // Criar nova prova com código único
    const prova = new Prova({
      titulo,
      disciplina,
      serie,
      turmas,
      professor,
      questoes: questoes || [],
      dataInicio,
      dataFim,
      duracao: duracao || 60,
      status: 'publicada',
      codigoProva: gerarCodigoProva()
    });

    await prova.save();

    res.status(201).json({
      success: true,
      data: prova
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Obter todas as provas de um professor
// @route   GET /api/provas
// @access  Private (Professor)
exports.getProvasProfessor = async (req, res) => {
  try {
    const { professor } = req.query;
    if (!professor) {
      return res.status(400).json({ msg: 'ID do professor é obrigatório' });
    }
    const provas = await Prova.find({ professor })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: provas.length,
      data: provas
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Obter provas disponíveis para um aluno
// @route   GET /api/provas/aluno
// @access  Private (Aluno)
exports.getProvasAluno = async (req, res) => {
  try {
    // Verificar se o usuário é aluno
    if (req.user.tipo !== 'aluno') {
      return res.status(403).json({ msg: 'Acesso negado' });
    }

    const agora = new Date();

    // Buscar provas publicadas para a turma do aluno
    const provas = await Prova.find({
      turmas: req.user.turma,
      serie: req.user.serie,
      status: 'publicada',
      dataInicio: { $lte: agora },
      dataFim: { $gte: agora }
    }).select('-questoes.alternativas.correta');

    res.json({
      success: true,
      count: provas.length,
      data: provas
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Obter uma prova por ID
// @route   GET /api/provas/:id
// @access  Private (Professor/Aluno)
exports.getProvaPorId = async (req, res) => {
  try {
    const prova = await Prova.findById(req.params.id);

    if (!prova) {
      return res.status(404).json({ msg: 'Prova não encontrada' });
    }

    // Verificar permissão
    if (
      req.user.tipo === 'professor' && prova.professor.toString() !== req.user.id ||
      req.user.tipo === 'aluno' && !prova.turmas.includes(req.user.turma)
    ) {
      return res.status(403).json({ msg: 'Acesso negado' });
    }

    // Se for aluno, não enviar as respostas corretas
    if (req.user.tipo === 'aluno') {
      // Criar uma cópia da prova sem as respostas corretas
      const provaAluno = prova.toObject();
      provaAluno.questoes = provaAluno.questoes.map(questao => {
        questao.alternativas = questao.alternativas.map(alt => ({
          _id: alt._id,
          texto: alt.texto
        }));
        return questao;
      });

      return res.json({
        success: true,
        data: provaAluno
      });
    }

    res.json({
      success: true,
      data: prova
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Atualizar uma prova
// @route   PUT /api/provas/:id
// @access  Private (Professor)
exports.atualizarProva = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { titulo, disciplina, serie, turmas, questoes, dataInicio, dataFim, duracao, status } = req.body;

    // Verificar se a prova existe
    let prova = await Prova.findById(req.params.id);

    if (!prova) {
      return res.status(404).json({ msg: 'Prova não encontrada' });
    }

    // Verificar se a prova pertence ao professor
    if (prova.professor.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Acesso negado' });
    }

    // Verificar se a prova já foi publicada e está tentando alterar questões
    if (prova.status !== 'rascunho' && questoes) {
      return res.status(400).json({ msg: 'Não é possível alterar questões de uma prova já publicada' });
    }

    // Atualizar campos
    if (titulo) prova.titulo = titulo;
    if (disciplina) prova.disciplina = disciplina;
    if (serie) prova.serie = serie;
    if (turmas) prova.turmas = turmas;
    if (questoes) prova.questoes = questoes;
    if (dataInicio) prova.dataInicio = dataInicio;
    if (dataFim) prova.dataFim = dataFim;
    if (duracao) prova.duracao = duracao;
    if (status) prova.status = status;

    await prova.save();

    res.json({
      success: true,
      data: prova
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Excluir uma prova
// @route   DELETE /api/provas/:id
// @access  Private (Professor)
exports.excluirProva = async (req, res) => {
  try {
    // Verificar se a prova existe
    const prova = await Prova.findById(req.params.id);

    if (!prova) {
      return res.status(404).json({ msg: 'Prova não encontrada' });
    }

    // Verificar se a prova pertence ao professor
    if (prova.professor.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Acesso negado' });
    }

    // Verificar se a prova já foi publicada
    if (prova.status !== 'rascunho') {
      return res.status(400).json({ msg: 'Não é possível excluir uma prova já publicada' });
    }

    await prova.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Publicar uma prova
// @route   PUT /api/provas/:id/publicar
// @access  Private (Professor)
exports.publicarProva = async (req, res) => {
  try {
    // Verificar se a prova existe
    let prova = await Prova.findById(req.params.id);

    if (!prova) {
      return res.status(404).json({ msg: 'Prova não encontrada' });
    }

    // Verificar se a prova pertence ao professor
    if (prova.professor.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Acesso negado' });
    }

    // Verificar se a prova já está publicada
    if (prova.status === 'publicada') {
      return res.status(400).json({ msg: 'Esta prova já está publicada' });
    }

    // Verificar se a prova tem questões
    if (prova.questoes.length === 0) {
      return res.status(400).json({ msg: 'Não é possível publicar uma prova sem questões' });
    }

    // Atualizar status
    prova.status = 'publicada';
    await prova.save();

    res.json({
      success: true,
      data: prova
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Encerrar uma prova
// @route   PUT /api/provas/:id/encerrar
// @access  Private (Professor)
exports.encerrarProva = async (req, res) => {
  try {
    // Verificar se a prova existe
    let prova = await Prova.findById(req.params.id);

    if (!prova) {
      return res.status(404).json({ msg: 'Prova não encontrada' });
    }

    // Verificar se a prova pertence ao professor
    if (prova.professor.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Acesso negado' });
    }

    // Verificar se a prova está publicada
    if (prova.status !== 'publicada') {
      return res.status(400).json({ msg: 'Apenas provas publicadas podem ser encerradas' });
    }

    // Atualizar status
    prova.status = 'encerrada';
    await prova.save();

    res.json({
      success: true,
      data: prova
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Obter uma prova pelo código
// @route   GET /api/provas/codigo/:codigo
// @access  Public
exports.getProvaPorCodigo = async (req, res) => {
  try {
    const codigo = req.params.codigo;
    
    if (!codigo) {
      return res.status(400).json({ msg: 'Código da prova é obrigatório' });
    }
    
    const prova = await Prova.findOne({ codigoProva: codigo });
    
    if (!prova) {
      return res.status(404).json({ msg: 'Prova não encontrada' });
    }
    
    // Verificar se a prova está publicada
    if (prova.status !== 'publicada') {
      return res.status(400).json({ msg: 'Esta prova não está disponível' });
    }
    
    res.json({
      success: true,
      prova: prova
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};
