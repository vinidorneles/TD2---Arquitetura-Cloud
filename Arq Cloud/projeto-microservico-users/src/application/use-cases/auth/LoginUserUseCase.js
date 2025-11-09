/**
 * LOGIN USER USE CASE (Application Layer)
 * Implements the business logic for user authentication
 */

const Email = require('../../../domain/value-objects/Email');

class LoginUserUseCase {
  constructor(userRepository, passwordHashService, tokenService) {
    this.userRepository = userRepository;
    this.passwordHashService = passwordHashService;
    this.tokenService = tokenService;
  }

  async execute({ email, password }) {
    // Validate email
    const emailVO = new Email(email);

    // Find user
    const user = await this.userRepository.findByEmail(emailVO.getValue());
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verify password
    const isValid = await this.passwordHashService.compare(password, user.password);
    if (!isValid) {
      throw new Error('Credenciais inválidas');
    }

    // Generate token
    const token = this.tokenService.generate(user.id);

    return {
      user: user.toPublicProfile(),
      token
    };
  }
}

module.exports = LoginUserUseCase;
