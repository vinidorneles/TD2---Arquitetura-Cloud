const axios = require('axios');

/**
 * Function 2: Send Notification Event
 *
 * This function receives an HTTP trigger to send notifications
 * about new events, updates, or user interactions
 */

// In-memory notification storage (in production, use a real notification service)
const notifications = [];

const sendNotification = async (req, res) => {
  try {
    const { type, userId, eventId, title, message, data } = req.body;

    // Validate input
    if (!type || !userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'type, userId, title e message são obrigatórios'
      });
    }

    // Valid notification types
    const validTypes = [
      'new_event',          // Novo evento criado
      'event_update',       // Evento atualizado
      'new_review',         // Nova avaliação
      'friend_going',       // Amigo vai comparecer
      'event_reminder',     // Lembrete de evento
      'event_cancelled'     // Evento cancelado
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Tipo inválido. Tipos válidos: ${validTypes.join(', ')}`
      });
    }

    // Create notification object
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

    // Store notification (in production, save to database or queue)
    notifications.push(notification);

    console.log(`📬 Notification sent: ${type} to user ${userId}`);

    // In production, you would:
    // 1. Save to database
    // 2. Send push notification via Firebase/OneSignal
    // 3. Send email via SendGrid/AWS SES
    // 4. Send SMS via Twilio
    // 5. Publish to message queue for async processing

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

// Helper endpoint to get user notifications (for testing)
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
