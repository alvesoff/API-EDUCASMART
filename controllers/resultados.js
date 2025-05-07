const Resultado = require('../models/Resultado');
const Prova = require('../models/Prova');
const { validationResult } = require('express-validator');

// @desc    Iniciar realização de prova
// @route   POST /api/resultados/iniciar
// @access  Private (Aluno)
exports.iniciarProva = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { provaId } = req.body;

    // Verificar se a prova existe
    const prova = await Prova.findById(provaId);

    if (!prova) {
      return res.status(404).json({ msg: 'Prova não encontrada' });
    }

    // Verificar se a prova está publicada e dentro do período válido
    const agora = new Date();
    if (prova.status !== 'publicada' || agora < prova.dataInicio || agora > prova.dataFim) {
      return res.status(403).json({ msg: 'Prova não disponível' });
    }

    // Verificar se o aluno pertence a uma das turmas da prova
    if (!prova.turmas.includes(req.user.turma)) {
      return res.status(403).json({ msg: 'Esta prova não está disponível para sua turma' });
    }

    // Verificar se o aluno já iniciou esta prova
    let resultado = await Resultado.findOne({ aluno: req.user.id, prova: provaId });

    if (resultado) {
      // Se já existe um resultado e está finalizado, não permitir nova tentativa
      if (resultado.status === 'finalizada') {
        return res.status(400).json({ msg: 'Você já realizou esta prova' });
      }

      // Se está em andamento, retornar o resultado existente
      return res.json({
        success: true,
        data: resultado
      });
    }

    // Criar novo resultado
    resultado = new Resultado({
      aluno: req.user.id,
      prova: provaId,
      respostas: [],
      pontuacaoTotal: 0,
      percentualAcerto: 0,
      tempoGasto: 0,
      dataInicio: agora,
      dataFim: null,
      status: 'em_andamento'
    });

    await resultado.save();

    res.status(201).json({
      success: true,
      data: resultado
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Submeter resposta de questão
// @route   PUT /api/resultados/responder
// @access  Private (Aluno)
exports.responderQuestao = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resultadoId, questaoIndex, alternativaIndex } = req.body;

    // Verificar se o resultado existe
    let resultado = await Resultado.findById(resultadoId);

    if (!resultado) {
      return res.status(404).json({ msg: 'Resultado não encontrado' });
    }

    // Verificar se o resultado pertence ao aluno
    if (resultado.aluno.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Acesso negado' });
    }

    // Verificar se a prova ainda está em andamento
    if (resultado.status !== 'em_andamento') {
      return res.status(400).json({ msg: 'Esta prova já foi finalizada' });
    }

    // Buscar a prova para verificar a resposta correta
    const prova = await Prova.findById(resultado.prova);

    if (!prova) {
      return res.status(404).json({ msg: 'Prova não encontrada' });
    }

    // Verificar se o índice da questão é válido
    if (questaoIndex < 0 || questaoIndex >= prova.questoes.length) {
      return res.status(400).json({ msg: 'Índice de questão inválido' });
    }

    // Verificar se o índice da alternativa é válido
    const questao = prova.questoes[questaoIndex];
    if (alternativaIndex < 0 || alternativaIndex >= questao.alternativas.length) {
      return res.status(400).json({ msg: 'Índice de alternativa inválido' });
    }

    // Verificar se a alternativa selecionada é a correta
    const alternativaCorreta = questao.alternativas.findIndex(alt => alt.correta);
    const correta = alternativaIndex === alternativaCorreta;
    const pontuacao = correta ? questao.pontuacao : 0;

    // Verificar se a questão já foi respondida
    const respostaExistente = resultado.respostas.findIndex(r => r.questao === questaoIndex);

    if (respostaExistente !== -1) {
      // Atualizar resposta existente
      resultado.respostas[respostaExistente] = {
        questao: questaoIndex,
        alternativaSelecionada: alternativaIndex,
        correta,
        pontuacao
      };
    } else {
      // Adicionar nova resposta
      resultado.respostas.push({
        questao: questaoIndex,
        alternativaSelecionada: alternativaIndex,
        correta,
        pontuacao
      });
    }

    // Recalcular pontuação total
    resultado.pontuacaoTotal = resultado.respostas.reduce((total, resp) => total + resp.pontuacao, 0);
    resultado.percentualAcerto = (resultado.pontuacaoTotal / prova.questoes.reduce((total, q) => total + q.pontuacao, 0)) * 100;

    await resultado.save();

    res.json({
      success: true,
      data: resultado
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Finalizar prova
// @route   PUT /api/resultados/finalizar
// @access  Public
exports.finalizarProva = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resultadoId, respostas } = req.body;

    // Verificar se o resultado existe
    let resultado = await Resultado.findById(resultadoId);

    if (!resultado) {
      return res.status(404).json({ msg: 'Resultado não encontrado' });
    }

    // Verificar se a prova ainda está em andamento
    if (resultado.status === 'finalizada') {
      return res.status(400).json({ msg: 'Esta prova já foi finalizada' });
    }

    // Calcular tempo gasto
    const agora = new Date();
    const tempoGastoMs = agora - new Date(resultado.dataInicio);
    const tempoGastoMin = Math.floor(tempoGastoMs / (1000 * 60));
    
    // Atualizar as respostas se foram enviadas
    if (respostas && Array.isArray(respostas)) {
      // Limpar respostas anteriores
      resultado.respostas = [];
      
      // Adicionar novas respostas
      respostas.forEach(resposta => {
        if (resposta.questao !== undefined && resposta.alternativaSelecionada !== undefined) {
          resultado.respostas.push({
            questao: resposta.questao,
            alternativaSelecionada: resposta.alternativaSelecionada,
            correta: resposta.correta || false,
            pontuacao: resposta.pontuacao || 0
          });
        }
      });
      
      // Recalcular pontuação total
      resultado.pontuacaoTotal = resultado.respostas.reduce((total, resp) => total + resp.pontuacao, 0);
    }

    // Atualizar resultado
    resultado.dataFim = agora;
    resultado.tempoGasto = tempoGastoMin;
    resultado.status = 'finalizado';

    await resultado.save();

    res.json({
      success: true,
      data: resultado
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Obter resultado de uma prova
// @route   GET /api/resultados/:id
// @access  Private (Aluno/Professor)
exports.getResultado = async (req, res) => {
  try {
    const resultado = await Resultado.findById(req.params.id)
      .populate('prova', 'titulo disciplina serie turmas questoes')
      .populate('aluno', 'nome email turma');

    if (!resultado) {
      return res.status(404).json({ msg: 'Resultado não encontrado' });
    }

    // Verificar permissão
    if (
      req.user.tipo === 'aluno' && resultado.aluno._id.toString() !== req.user.id ||
      req.user.tipo === 'professor' && !resultado.prova.professor.equals(req.user.id)
    ) {
      return res.status(403).json({ msg: 'Acesso negado' });
    }

    res.json({
      success: true,
      data: resultado
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Listar resultados de um aluno
// @route   GET /api/resultados/aluno/:alunoId
// @access  Private (Aluno/Professor)
exports.getResultadosPorAluno = async (req, res) => {
  try {
    // Verificar permissão
    if (req.user.tipo === 'aluno' && req.params.alunoId !== req.user.id) {
      return res.status(403).json({ msg: 'Acesso negado' });
    }

    const resultados = await Resultado.find({ aluno: req.params.alunoId })
      .populate('prova', 'titulo disciplina serie turmas')
      .sort({ dataInicio: -1 });

    res.json({
      success: true,
      count: resultados.length,
      data: resultados
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Listar resultados de uma prova
// @route   GET /api/resultados/prova/:provaId
// @access  Private (Professor)
exports.getResultadosPorProva = async (req, res) => {
  try {
    // Verificar se a prova existe e pertence ao professor
    const prova = await Prova.findById(req.params.provaId);

    if (!prova) {
      return res.status(404).json({ msg: 'Prova não encontrada' });
    }

    if (prova.professor.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Acesso negado' });
    }

    const resultados = await Resultado.find({ prova: req.params.provaId })
      .populate('aluno', 'nome email turma')
      .sort({ pontuacaoTotal: -1 });

    res.json({
      success: true,
      count: resultados.length,
      data: resultados
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Obter estatísticas de uma prova
// @route   GET /api/resultados/estatisticas/:provaId
// @access  Private (Professor)
exports.getEstatisticasProva = async (req, res) => {
  try {
    // Verificar se a prova existe e pertence ao professor
    const prova = await Prova.findById(req.params.provaId);

    if (!prova) {
      return res.status(404).json({ msg: 'Prova não encontrada' });
    }

    if (prova.professor.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Acesso negado' });
    }

    // Buscar todos os resultados finalizados da prova
    const resultados = await Resultado.find({ 
      prova: req.params.provaId,
      status: 'finalizado'
    });

    if (resultados.length === 0) {
      return res.json({
        success: true,
        data: {
          totalAlunos: 0,
          mediaAcertos: 0,
          mediaTempo: 0,
          distribuicaoNotas: [],
          questoesAcertos: []
        }
      });
    }

    // Calcular estatísticas
    const totalAlunos = resultados.length;
    const mediaAcertos = resultados.reduce((acc, curr) => acc + curr.percentualAcerto, 0) / totalAlunos;
    const mediaTempo = resultados.reduce((acc, curr) => acc + curr.tempoGasto, 0) / totalAlunos;

    // Distribuição de notas
    const distribuicaoNotas = [
      { faixa: '0-20%', quantidade: 0 },
      { faixa: '21-40%', quantidade: 0 },
      { faixa: '41-60%', quantidade: 0 },
      { faixa: '61-80%', quantidade: 0 },
      { faixa: '81-100%', quantidade: 0 }
    ];

    resultados.forEach(resultado => {
      const percentual = resultado.percentualAcerto;
      if (percentual <= 20) distribuicaoNotas[0].quantidade++;
      else if (percentual <= 40) distribuicaoNotas[1].quantidade++;
      else if (percentual <= 60) distribuicaoNotas[2].quantidade++;
      else if (percentual <= 80) distribuicaoNotas[3].quantidade++;
      else distribuicaoNotas[4].quantidade++;
    });

    // Percentual de acertos por questão
    const questoesAcertos = [];
    
    // Inicializar array com todas as questões
    for (let i = 0; i < prova.questoes.length; i++) {
      questoesAcertos.push({
        questaoIndex: i,
        enunciado: prova.questoes[i].enunciado.substring(0, 50) + '...',
        totalRespostas: 0,
        acertos: 0,
        percentualAcerto: 0
      });
    }

    // Calcular acertos por questão
    resultados.forEach(resultado => {
      resultado.respostas.forEach(resposta => {
        const questaoIndex = resposta.questao;
        if (questaoIndex >= 0 && questaoIndex < questoesAcertos.length) {
          questoesAcertos[questaoIndex].totalRespostas++;
          if (resposta.correta) {
            questoesAcertos[questaoIndex].acertos++;
          }
        }
      });
    });

    // Calcular percentual de acerto por questão
    questoesAcertos.forEach(questao => {
      if (questao.totalRespostas > 0) {
        questao.percentualAcerto = (questao.acertos / questao.totalRespostas) * 100;
      }
    });

    res.json({
      success: true,
      data: {
        totalAlunos,
        mediaAcertos,
        mediaTempo,
        distribuicaoNotas,
        questoesAcertos
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Listar todos os resultados
// @route   GET /api/resultados
// @access  Private (Admin/Professor)
exports.getAllResultados = async (req, res) => {
  try {
    // Verificar permissão (apenas professores e administradores)
    if (req.user.tipo !== 'professor' && req.user.tipo !== 'admin') {
      return res.status(403).json({ msg: 'Acesso negado' });
    }

    // Configurar paginação
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Construir a query
    let query = {};
    
    // Filtrar por status se fornecido
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filtrar por prova se fornecido
    if (req.query.provaId) {
      query.prova = req.query.provaId;
    }
    
    // Filtrar por aluno se fornecido
    if (req.query.alunoId) {
      query.aluno = req.query.alunoId;
    }
    
    // Filtrar por turma (através da informação do aluno)
    if (req.query.turma) {
      // Precisamos fazer um lookup para isso
      const alunosDaTurma = await require('../models/Usuario').find({ turma: req.query.turma }).select('_id');
      const alunosIds = alunosDaTurma.map(aluno => aluno._id);
      query.aluno = { $in: alunosIds };
    }

    // Contar total de documentos que correspondem à query
    const total = await Resultado.countDocuments(query);
    
    // Buscar resultados com paginação
    const resultados = await Resultado.find(query)
      .populate('prova', 'titulo disciplina serie turmas')
      .populate('aluno', 'nome email turma')
      .sort({ dataInicio: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: resultados.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: resultados
    });
  } catch (err) {
    console.error('Erro ao listar resultados:', err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Buscar resultados pelo código da prova
// @route   GET /api/resultados/codigo/:codigoProva
// @access  Private (Admin/Professor)
exports.getResultadosPorCodigoProva = async (req, res) => {
  try {
    // Verificar permissão (apenas professores e administradores)
    if (req.user.tipo !== 'professor' && req.user.tipo !== 'admin') {
      return res.status(403).json({ msg: 'Acesso negado' });
    }

    const { codigoProva } = req.params;

    if (!codigoProva) {
      return res.status(400).json({ msg: 'Código da prova é obrigatório' });
    }

    // Buscar prova pelo código
    const prova = await Prova.findOne({ codigo: codigoProva });

    if (!prova) {
      return res.status(404).json({ msg: 'Prova não encontrada com este código' });
    }

    // Configurar paginação
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Construir a query base
    let query = { codigoProva };

    // Filtrar por status se fornecido
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filtrar por turma se fornecido
    if (req.query.turma) {
      query.turma = req.query.turma;
    }

    // Contar total de documentos que correspondem à query
    const total = await Resultado.countDocuments(query);

    // Buscar resultados com paginação
    const resultados = await Resultado.find(query)
      .populate('prova', 'titulo disciplina serie turmas')
      .populate('aluno', 'nome email turma')
      .sort({ dataInicio: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: resultados.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: resultados
    });
  } catch (err) {
    console.error('Erro ao buscar resultados por código de prova:', err.message);
    res.status(500).send('Erro no servidor');
  }
};

// @desc    Obter estatísticas avançadas para dashboard
// @route   GET /api/resultados/estatisticas/avancadas
// @access  Private (Admin/Professor)
exports.getEstatisticasAvancadas = async (req, res) => {
  try {
    // Verificar permissão (apenas professores e administradores)
    if (req.user.tipo !== 'professor' && req.user.tipo !== 'admin') {
      return res.status(403).json({ msg: 'Acesso negado' });
    }

    // Filtros opcionais
    const { disciplina, turma, periodo } = req.query;
    
    // Construir query base
    let query = { status: 'finalizada' };
    let matchProva = {};
    
    // Aplicar filtro de disciplina
    if (disciplina) {
      matchProva.disciplina = disciplina;
    }
    
    // Aplicar filtro de turma
    if (turma) {
      matchProva.turmas = turma;
    }
    
    // Aplicar filtro de período
    if (periodo) {
      const hoje = new Date();
      let dataInicio = new Date();
      
      switch(periodo) {
        case 'semana':
          dataInicio.setDate(hoje.getDate() - 7);
          break;
        case 'mes':
          dataInicio.setMonth(hoje.getMonth() - 1);
          break;
        case 'trimestre':
          dataInicio.setMonth(hoje.getMonth() - 3);
          break;
        case 'semestre':
          dataInicio.setMonth(hoje.getMonth() - 6);
          break;
        case 'ano':
          dataInicio.setFullYear(hoje.getFullYear() - 1);
          break;
        default:
          // Não aplicar filtro de data
          break;
      }
      
      if (periodo !== 'todos') {
        query.dataFim = { $gte: dataInicio, $lte: hoje };
      }
    }

    // Obter todos os resultados com os filtros aplicados
    const resultados = await Resultado.find(query)
      .populate({
        path: 'prova',
        match: matchProva,
        select: 'titulo disciplina turmas questoes dataInicio dataFim'
      })
      .populate('aluno', 'nome email turma')
      .sort({ dataFim: -1 });
    
    // Filtrar resultados cujas provas não atendem aos critérios
    const resultadosFiltrados = resultados.filter(r => r.prova !== null);
    
    if (resultadosFiltrados.length === 0) {
      return res.json({
        success: true,
        data: {
          evoluçãoTemporal: [],
          mediaPorConteudo: [],
          mediaPorTurma: [],
          distribuicaoNotas: [],
          questoesDificeis: [],
          desempenhoIndividual: []
        }
      });
    }

    // === Análise 1: Evolução temporal ===
    // Agrupa os resultados por data (mês) e calcula a média
    const evoluçãoTemporal = {};
    resultadosFiltrados.forEach(resultado => {
      const data = new Date(resultado.dataFim);
      const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
      
      if (!evoluçãoTemporal[mesAno]) {
        evoluçãoTemporal[mesAno] = {
          totalNotas: 0,
          quantidade: 0,
          media: 0
        };
      }
      
      evoluçãoTemporal[mesAno].totalNotas += resultado.percentualAcerto;
      evoluçãoTemporal[mesAno].quantidade += 1;
    });
    
    // Calcular médias e formatar para o gráfico
    const evoluçãoTemporalArray = Object.keys(evoluçãoTemporal).map(mesAno => {
      const item = evoluçãoTemporal[mesAno];
      return {
        periodo: mesAno,
        media: (item.totalNotas / item.quantidade).toFixed(2)
      };
    }).sort((a, b) => {
      const [mesA, anoA] = a.periodo.split('/');
      const [mesB, anoB] = b.periodo.split('/');
      return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1);
    });

    // === Análise 2: Média por conteúdo/tópico ===
    // Mapear questões por conteúdo e calcular taxa de acerto
    const conteudoMap = {};
    
    resultadosFiltrados.forEach(resultado => {
      resultado.respostas.forEach(resposta => {
        const questaoIndex = resposta.questao;
        const questao = resultado.prova.questoes[questaoIndex];
        
        if (questao && questao.conteudo) {
          if (!conteudoMap[questao.conteudo]) {
            conteudoMap[questao.conteudo] = {
              totalRespostas: 0,
              totalAcertos: 0,
              taxaAcerto: 0
            };
          }
          
          conteudoMap[questao.conteudo].totalRespostas += 1;
          if (resposta.correta) {
            conteudoMap[questao.conteudo].totalAcertos += 1;
          }
        }
      });
    });
    
    // Calcular taxa de acerto por conteúdo
    const mediaPorConteudo = Object.keys(conteudoMap).map(conteudo => {
      const item = conteudoMap[conteudo];
      return {
        conteudo,
        taxaAcerto: ((item.totalAcertos / item.totalRespostas) * 100).toFixed(2),
        totalRespostas: item.totalRespostas
      };
    }).sort((a, b) => b.taxaAcerto - a.taxaAcerto);

    // === Análise 3: Média por turma ===
    const turmaMap = {};
    
    resultadosFiltrados.forEach(resultado => {
      if (resultado.aluno && resultado.aluno.turma) {
        const turma = resultado.aluno.turma;
        
        if (!turmaMap[turma]) {
          turmaMap[turma] = {
            totalNotas: 0,
            quantidade: 0,
            media: 0
          };
        }
        
        turmaMap[turma].totalNotas += resultado.percentualAcerto;
        turmaMap[turma].quantidade += 1;
      }
    });
    
    // Calcular média por turma
    const mediaPorTurma = Object.keys(turmaMap).map(turma => {
      const item = turmaMap[turma];
      return {
        turma,
        media: (item.totalNotas / item.quantidade).toFixed(2),
        totalAlunos: item.quantidade
      };
    }).sort((a, b) => b.media - a.media);

    // === Análise 4: Distribuição de notas ===
    const distribuicaoNotas = [
      { faixa: '0-2.0', quantidade: 0 },
      { faixa: '2.1-4.0', quantidade: 0 },
      { faixa: '4.1-6.0', quantidade: 0 },
      { faixa: '6.1-8.0', quantidade: 0 },
      { faixa: '8.1-10.0', quantidade: 0 }
    ];

    resultadosFiltrados.forEach(resultado => {
      const nota = (resultado.percentualAcerto / 10); // convertendo percentual para nota de 0-10
      if (nota <= 2) distribuicaoNotas[0].quantidade++;
      else if (nota <= 4) distribuicaoNotas[1].quantidade++;
      else if (nota <= 6) distribuicaoNotas[2].quantidade++;
      else if (nota <= 8) distribuicaoNotas[3].quantidade++;
      else distribuicaoNotas[4].quantidade++;
    });

    // === Análise 5: Questões mais difíceis ===
    const questoesMap = {};
    
    resultadosFiltrados.forEach(resultado => {
      resultado.respostas.forEach(resposta => {
        const questaoIndex = resposta.questao;
        const questao = resultado.prova.questoes[questaoIndex];
        
        if (questao) {
          const questaoId = `${resultado.prova._id}_${questaoIndex}`;
          
          if (!questoesMap[questaoId]) {
            questoesMap[questaoId] = {
              id: questaoId,
              enunciado: questao.enunciado.substring(0, 100) + (questao.enunciado.length > 100 ? '...' : ''),
              disciplina: resultado.prova.disciplina,
              conteudo: questao.conteudo || 'Não especificado',
              totalRespostas: 0,
              totalAcertos: 0,
              taxaAcerto: 0
            };
          }
          
          questoesMap[questaoId].totalRespostas += 1;
          if (resposta.correta) {
            questoesMap[questaoId].totalAcertos += 1;
          }
        }
      });
    });
    
    // Calcular taxa de acerto por questão e identificar as mais difíceis
    const questoesDificeis = Object.values(questoesMap)
      .filter(q => q.totalRespostas >= 5) // Questões com pelo menos 5 respostas
      .map(q => ({
        ...q,
        taxaAcerto: ((q.totalAcertos / q.totalRespostas) * 100).toFixed(2)
      }))
      .sort((a, b) => a.taxaAcerto - b.taxaAcerto) // Ordenar da menor para a maior taxa de acerto
      .slice(0, 10); // Top 10 questões mais difíceis

    // === Análise 6: Desempenho individual dos alunos ===
    const alunosMap = {};
    
    resultadosFiltrados.forEach(resultado => {
      if (resultado.aluno) {
        const alunoId = resultado.aluno._id.toString();
        
        if (!alunosMap[alunoId]) {
          alunosMap[alunoId] = {
            id: alunoId,
            nome: resultado.aluno.nome,
            turma: resultado.aluno.turma,
            totalNotas: 0,
            totalProvas: 0,
            mediaGeral: 0,
            evolucao: []
          };
        }
        
        alunosMap[alunoId].totalNotas += resultado.percentualAcerto;
        alunosMap[alunoId].totalProvas += 1;
        
        // Adicionar resultado à evolução do aluno
        alunosMap[alunoId].evolucao.push({
          data: resultado.dataFim,
          percentualAcerto: resultado.percentualAcerto,
          provaId: resultado.prova._id,
          provaTitulo: resultado.prova.titulo
        });
      }
    });
    
    // Calcular média geral por aluno e ordenar evolução
    const desempenhoIndividual = Object.values(alunosMap).map(aluno => {
      return {
        ...aluno,
        mediaGeral: (aluno.totalNotas / aluno.totalProvas).toFixed(2),
        evolucao: aluno.evolucao.sort((a, b) => new Date(a.data) - new Date(b.data))
      };
    }).sort((a, b) => b.mediaGeral - a.mediaGeral);

    // Retornar todas as análises
    res.json({
      success: true,
      data: {
        evoluçãoTemporal: evoluçãoTemporalArray,
        mediaPorConteudo,
        mediaPorTurma,
        distribuicaoNotas,
        questoesDificeis,
        desempenhoIndividual: desempenhoIndividual.slice(0, 20) // Limitar a 20 alunos
      }
    });
  } catch (err) {
    console.error('Erro ao gerar estatísticas avançadas:', err.message);
    res.status(500).send('Erro no servidor');
  }
};