/**
 * AUTH CONTROLLER (Presentation Layer - Clean Architecture)
 * Uses dependency injection and use cases
 * No business logic here, only request/response handling
 */

const container = require('../../infrastructure/di/container');
const { validationResult } = require('express-validator');

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Use case handles all business logic
      const useCase = container.createRegisterUserUseCase();
      const result = await useCase.execute({ name, email, password });

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Error in register:', error);

      // Handle domain errors
      if (error.message === 'E-mail já cadastrado') {
        return res.status(409).json({ message: error.message });
      }

      if (error.message.includes('Email') || error.message.includes('Senha')) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const useCase = container.createLoginUserUseCase();
      const result = await useCase.execute({ email, password });

      res.json({
        token: result.token,
        user: result.user
      });
    } catch (error) {
      console.error('Error in login:', error);

      if (error.message === 'Credenciais inválidas') {
        return res.status(401).json({ message: error.message });
      }

      if (error.message.includes('Email')) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: 'Erro ao realizar login', error: error.message });
    }
  }

  // Social auth can be implemented similarly with a SocialAuthUseCase
  async socialAuth(req, res) {
    try {
      const { provider, token, email, name, profilePicture } = req.body;

      if (!['google', 'facebook'].includes(provider)) {
        return res.status(400).json({ message: 'Provedor inválido' });
      }

      // TODO: Implement SocialAuthUseCase
      res.status(501).json({ message: 'Social auth use case not yet implemented' });
    } catch (error) {
      console.error('Error in socialAuth:', error);
      res.status(500).json({ message: 'Erro na autenticação social', error: error.message });
    }
  }
}

module.exports = new AuthController();
