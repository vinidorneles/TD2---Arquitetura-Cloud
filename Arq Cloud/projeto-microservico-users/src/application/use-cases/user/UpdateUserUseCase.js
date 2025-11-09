/**
 * UPDATE USER USE CASE (Application Layer)
 */

class UpdateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, requestingUserId, updateData) {
    // Authorization check
    if (userId !== requestingUserId) {
      throw new Error('Não autorizado');
    }

    // Get current user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Update user entity
    user.update(updateData);

    // Persist changes
    const updatedUser = await this.userRepository.update(userId, user);

    return updatedUser.toPublicProfile();
  }
}

module.exports = UpdateUserUseCase;
