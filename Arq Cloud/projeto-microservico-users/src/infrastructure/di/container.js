/**
 * DEPENDENCY INJECTION CONTAINER
 * Wires all dependencies together following Clean Architecture
 * This is where we compose our application
 */

// Infrastructure
const MongoUserRepository = require('../database/mongodb/repositories/MongoUserRepository');
const BcryptPasswordService = require('../services/BcryptPasswordService');
const JwtTokenService = require('../services/JwtTokenService');

// Use Cases
const RegisterUserUseCase = require('../../application/use-cases/auth/RegisterUserUseCase');
const LoginUserUseCase = require('../../application/use-cases/auth/LoginUserUseCase');
const GetUserByIdUseCase = require('../../application/use-cases/user/GetUserByIdUseCase');
const GetUsersUseCase = require('../../application/use-cases/user/GetUsersUseCase');
const UpdateUserUseCase = require('../../application/use-cases/user/UpdateUserUseCase');

class Container {
  constructor() {
    this._instances = {};
  }

  // Infrastructure Services (Singletons)
  get userRepository() {
    if (!this._instances.userRepository) {
      this._instances.userRepository = new MongoUserRepository();
    }
    return this._instances.userRepository;
  }

  get passwordHashService() {
    if (!this._instances.passwordHashService) {
      this._instances.passwordHashService = new BcryptPasswordService(10);
    }
    return this._instances.passwordHashService;
  }

  get tokenService() {
    if (!this._instances.tokenService) {
      this._instances.tokenService = new JwtTokenService(
        process.env.JWT_SECRET,
        process.env.JWT_EXPIRES_IN || '7d'
      );
    }
    return this._instances.tokenService;
  }

  // Use Cases (Created on each request for stateless behavior)
  createRegisterUserUseCase() {
    return new RegisterUserUseCase(
      this.userRepository,
      this.passwordHashService,
      this.tokenService
    );
  }

  createLoginUserUseCase() {
    return new LoginUserUseCase(
      this.userRepository,
      this.passwordHashService,
      this.tokenService
    );
  }

  createGetUserByIdUseCase() {
    return new GetUserByIdUseCase(this.userRepository);
  }

  createGetUsersUseCase() {
    return new GetUsersUseCase(this.userRepository);
  }

  createUpdateUserUseCase() {
    return new UpdateUserUseCase(this.userRepository);
  }
}

// Export singleton instance
module.exports = new Container();
