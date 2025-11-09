/**
 * USER REPOSITORY INTERFACE (Domain Layer - Port)
 * Defines the contract for user persistence
 * Infrastructure layer will implement this interface
 */

class IUserRepository {
  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findByEmail(email) {
    throw new Error('Method not implemented');
  }

  async findAll({ page, limit, search }) {
    throw new Error('Method not implemented');
  }

  async create(user) {
    throw new Error('Method not implemented');
  }

  async update(id, userData) {
    throw new Error('Method not implemented');
  }

  async delete(id) {
    throw new Error('Method not implemented');
  }

  async count(query) {
    throw new Error('Method not implemented');
  }
}

module.exports = IUserRepository;
