/**
 * REGISTER USER USE CASE (Application Layer)
 * Implements the business logic for user registration
 * Dependencies are injected (Dependency Inversion Principle)
 */

const User = require('../../../domain/entities/User');
const Email = require('../../../domain/value-objects/Email');
const Password = require('../../../domain/value-objects/Password');

class RegisterUserUseCase {
  constructor(userRepository, passwordHashService, tokenService) {
    this.userRepository = userRepository;
    this.passwordHashService = passwordHashService;
    this.tokenService = tokenService;
  }

  async execute({ name, email, password }) {
    // Validate value objects
    const emailVO = new Email(email);
    const passwordVO = new Password(password);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(emailVO.getValue());
    if (existingUser) {
      throw new Error('E-mail já cadastrado');
    }

    // Hash password
    const hashedPassword = await this.passwordHashService.hash(passwordVO.getValue());

    // Create user entity
    const user = new User({
      name,
      email: emailVO.getValue(),
      password: hashedPassword,
      authProvider: 'local'
    });

    // Persist user
    const savedUser = await this.userRepository.create(user);

    // Generate token
    const token = this.tokenService.generate(savedUser.id);

    return {
      user: savedUser.toPublicProfile(),
      token
    };
  }
}

module.exports = RegisterUserUseCase;
