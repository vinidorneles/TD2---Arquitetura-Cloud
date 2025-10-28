

const auth = (req, res, next) => {
  try {

    const userId = req.header('X-User-Id');

    if (!userId) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Autenticação inválida' });
  }
};

module.exports = auth;
