const Friendship = require('../models/Friendship');
const User = require('../models/User');

exports.getFriendships = async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.userId;

    let query = {
      $or: [{ userId }, { friendId: userId }]
    };

    if (status) {
      query.status = status;
    }

    const friendships = await Friendship.find(query)
      .populate('userId', 'name email profilePicture')
      .populate('friendId', 'name email profilePicture')
      .sort({ createdAt: -1 });

    const formattedFriendships = friendships.map(friendship => {
      const isUserInitiator = friendship.userId._id.toString() === userId;
      return {
        _id: friendship._id,
        userId: friendship.userId._id,
        friendId: friendship.friendId._id,
        friend: isUserInitiator ? friendship.friendId : friendship.userId,
        status: friendship.status,
        createdAt: friendship.createdAt
      };
    });

    res.json(formattedFriendships);
  } catch (error) {
    console.error('Error in getFriendships:', error);
    res.status(500).json({ message: 'Erro ao buscar amizades', error: error.message });
  }
};

exports.createFriendship = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.userId;

    if (userId === friendId) {
      return res.status(400).json({ message: 'Não é possível adicionar a si mesmo' });
    }

    const friendExists = await User.findById(friendId);
    if (!friendExists) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const existingFriendship = await Friendship.findOne({
      $or: [
        { userId, friendId },
        { userId: friendId, friendId: userId }
      ]
    });

    if (existingFriendship) {
      return res.status(400).json({ message: 'Solicitação de amizade já existe' });
    }

    const friendship = new Friendship({
      userId,
      friendId,
      status: 'pending'
    });

    await friendship.save();
    await friendship.populate('friendId', 'name email profilePicture');

    res.status(201).json({
      _id: friendship._id,
      userId: friendship.userId,
      friendId: friendship.friendId._id,
      friend: friendship.friendId,
      status: friendship.status,
      createdAt: friendship.createdAt
    });
  } catch (error) {
    console.error('Error in createFriendship:', error);
    res.status(500).json({ message: 'Erro ao criar amizade', error: error.message });
  }
};

exports.updateFriendship = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido' });
    }

    const friendship = await Friendship.findById(id);

    if (!friendship) {
      return res.status(404).json({ message: 'Amizade não encontrada' });
    }

    if (friendship.friendId.toString() !== userId) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    friendship.status = status;
    await friendship.save();
    await friendship.populate('userId', 'name email profilePicture');
    await friendship.populate('friendId', 'name email profilePicture');

    res.json({
      _id: friendship._id,
      userId: friendship.userId._id,
      friendId: friendship.friendId._id,
      friend: friendship.userId,
      status: friendship.status,
      createdAt: friendship.createdAt
    });
  } catch (error) {
    console.error('Error in updateFriendship:', error);
    res.status(500).json({ message: 'Erro ao atualizar amizade', error: error.message });
  }
};

exports.deleteFriendship = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const friendship = await Friendship.findById(id);

    if (!friendship) {
      return res.status(404).json({ message: 'Amizade não encontrada' });
    }

    if (friendship.userId.toString() !== userId && friendship.friendId.toString() !== userId) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    await Friendship.findByIdAndDelete(id);

    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteFriendship:', error);
    res.status(500).json({ message: 'Erro ao deletar amizade', error: error.message });
  }
};
