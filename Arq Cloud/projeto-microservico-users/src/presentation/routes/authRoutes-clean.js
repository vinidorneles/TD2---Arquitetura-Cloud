/**
 * AUTH ROUTES (Clean Architecture)
 * Using Clean Architecture controllers
 */

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController-clean');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
];

// Routes
router.post('/register', registerValidation, authController.register.bind(authController));
router.post('/login', loginValidation, authController.login.bind(authController));
router.post('/social-auth', authController.socialAuth.bind(authController));

module.exports = router;
