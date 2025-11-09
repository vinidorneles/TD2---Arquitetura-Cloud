/**
 * AZURE FUNCTION - Event Created Handler
 *
 * Triggered by Service Bus messages on queue 'event.created'
 * Sends notifications when new events are created
 */

module.exports = async function (context, message) {
  context.log('📥 Event Created Function triggered:', message);

  try {
    const { eventId, name, organizerId, category, location } = message;

    // Create notification for followers
    const notification = {
      type: 'NEW_EVENT',
      message: `New event: ${name} in ${location}`,
      category,
      eventId,
      timestamp: new Date().toISOString()
    };

    context.log('📧 Notification created:', notification);

    // Here you would:
    // - Save notification to database
    // - Send push notifications via Azure Notification Hub
    // - Send emails via SendGrid
    // - Update statistics in CosmosDB

    context.log('✅ Event created notification processed');

    return {
      status: 200,
      body: { success: true, notification }
    };

  } catch (error) {
    context.log.error('❌ Error processing event.created:', error);

    return {
      status: 500,
      body: { error: error.message }
    };
  }
};
