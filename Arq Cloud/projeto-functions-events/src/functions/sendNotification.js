const axios = require('axios');

const notifications = [];

const sendNotification = async (req, res) => {
  try {
    const { type, userId, eventId, title, message, data } = req.body;

    if (!type || !userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'type, userId, title e message são obrigatórios'
      });
    }

    const validTypes = [
      'new_event',
      'event_update',
      'new_review',
      'friend_going',
      'event_reminder',
      'event_cancelled'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Tipo inválido. Tipos válidos: ${validTypes.join(', ')}`
      });
    }

    const notification = {
      id: Date.now().toString(),
      type,
      userId,
      eventId: eventId || null,
      title,
      message,
      data: data || {},
      read: false,
      createdAt: new Date().toISOString()
    };

    notifications.push(notification);

    console.log(`📬 Notification sent: ${type} to user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Notificação enviada com sucesso',
      data: notification,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in sendNotification:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar notificação',
      error: error.message
    });
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const userNotifications = notifications.filter(n => n.userId === userId);

    res.json({
      success: true,
      total: userNotifications.length,
      unread: userNotifications.filter(n => !n.read).length,
      notifications: userNotifications
    });

  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar notificações',
      error: error.message
    });
  }
};

module.exports = {
  sendNotification,
  getUserNotifications
};
