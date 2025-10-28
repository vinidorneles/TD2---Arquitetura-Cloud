const Timeline = require('../models/Timeline');

exports.getTimeline = async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const targetUserId = userId || req.userId;

    const posts = await Timeline.find({ userId: targetUserId })
      .populate('userId', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Timeline.countDocuments({ userId: targetUserId });

    res.json({
      posts,
      total,
      page: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getTimeline:', error);
    res.status(500).json({ message: 'Erro ao buscar timeline', error: error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content, type } = req.body;

    if (!['post', 'event', 'review'].includes(type)) {
      return res.status(400).json({ message: 'Tipo de post inválido' });
    }

    const post = new Timeline({
      userId: req.userId,
      content,
      type
    });

    await post.save();
    await post.populate('userId', 'name email profilePicture');

    res.status(201).json(post);
  } catch (error) {
    console.error('Error in createPost:', error);
    res.status(500).json({ message: 'Erro ao criar post', error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Timeline.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    if (post.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    await Timeline.findByIdAndDelete(id);

    res.status(204).send();
  } catch (error) {
    console.error('Error in deletePost:', error);
    res.status(500).json({ message: 'Erro ao deletar post', error: error.message });
  }
};
