const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'E-mail já cadastrado' });
    }

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

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

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

exports.socialAuth = async (req, res) => {
  try {
    const { provider, token, email, name, profilePicture } = req.body;

    if (!['google', 'facebook'].includes(provider)) {
      return res.status(400).json({ message: 'Provedor inválido' });
    }

    let user = await User.findOne({ email });

    if (!user) {

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
