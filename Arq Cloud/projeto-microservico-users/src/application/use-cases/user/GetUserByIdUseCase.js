/**
 * GET USER BY ID USE CASE (Application Layer)
 */

class GetUserByIdUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user.toPublicProfile();
  }
}

module.exports = GetUserByIdUseCase;
