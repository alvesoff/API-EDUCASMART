const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Obter token do header
  const token = req.header('x-auth-token');

  // Verificar se não há token
  if (!token) {
    return res.status(401).json({ msg: 'Sem token, autorização negada' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar se é professor
    if (decoded.user.tipo !== 'professor') {
      return res.status(403).json({ msg: 'Acesso negado. Apenas professores podem acessar este recurso' });
    }

    // Adicionar usuário ao request
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token inválido' });
  }
};