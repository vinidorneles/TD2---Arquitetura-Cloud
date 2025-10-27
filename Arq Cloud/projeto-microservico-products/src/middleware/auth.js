// Simple auth middleware that extracts userId from header
// In production, this would validate JWT or use internal service authentication
const auth = (req, res, next) => {
  try {
    // Extract userId from custom header (set by BFF)
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
