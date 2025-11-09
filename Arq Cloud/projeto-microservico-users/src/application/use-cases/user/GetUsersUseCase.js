/**
 * GET USERS USE CASE (Application Layer)
 * Handles pagination and search
 */

class GetUsersUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ page = 1, limit = 10, search = '' }) {
    const result = await this.userRepository.findAll({ page, limit, search });

    return {
      users: result.users.map(user => user.toPublicProfile()),
      total: result.total,
      page: parseInt(page),
      totalPages: Math.ceil(result.total / limit)
    };
  }
}

module.exports = GetUsersUseCase;
