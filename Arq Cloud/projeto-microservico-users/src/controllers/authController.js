const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'E-mail já cadastrado' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      authProvider: 'local'
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user,
      token
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Erro ao realizar login', error: error.message });
  }
};

// Social authentication (Google/Facebook)
exports.socialAuth = async (req, res) => {
  try {
    const { provider, token, email, name, profilePicture } = req.body;

    if (!['google', 'facebook'].includes(provider)) {
      return res.status(400).json({ message: 'Provedor inválido' });
    }

    // In production, validate the token with the provider's API
    // For now, we'll trust the client

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        name,
        email,
        authProvider: provider,
        profilePicture: profilePicture || ''
      });
      await user.save();
    }

    const jwtToken = generateToken(user._id);

    res.json({
      token: jwtToken,
      user
    });
  } catch (error) {
    console.error('Error in socialAuth:', error);
    res.status(500).json({ message: 'Erro na autenticação social', error: error.message });
  }
};
