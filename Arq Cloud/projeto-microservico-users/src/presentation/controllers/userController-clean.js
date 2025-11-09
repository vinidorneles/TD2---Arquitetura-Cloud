/**
 * USER CONTROLLER (Presentation Layer - Clean Architecture)
 * Uses dependency injection and use cases
 */

const container = require('../../infrastructure/di/container');

class UserController {
  async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const useCase = container.createGetUsersUseCase();
      const result = await useCase.execute({ page, limit, search });

      res.json(result);
    } catch (error) {
      console.error('Error in getUsers:', error);
      res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const useCase = container.createGetUserByIdUseCase();
      const user = await useCase.execute(req.params.id);

      res.json(user);
    } catch (error) {
      console.error('Error in getUserById:', error);

      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({ message: 'Erro ao buscar usuário', error: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, profilePicture, location } = req.body;

      const useCase = container.createUpdateUserUseCase();
      const user = await useCase.execute(id, req.userId, { name, profilePicture, location });

      res.json(user);
    } catch (error) {
      console.error('Error in updateUser:', error);

      if (error.message === 'Não autorizado') {
        return res.status(403).json({ message: error.message });
      }

      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (req.userId !== id) {
        return res.status(403).json({ message: 'Não autorizado' });
      }

      const deleted = await container.userRepository.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteUser:', error);
      res.status(500).json({ message: 'Erro ao deletar usuário', error: error.message });
    }
  }
}

module.exports = new UserController();
