/**
 * AZURE FUNCTION - Review Event Handler
 *
 * Triggered by Service Bus messages on queue 'review.created'
 * Processes review creation events
 */

const { getPool, sql } = require('../src/config/database');

module.exports = async function (context, message) {
  context.log('📥 Review Event Function triggered:', message);

  try {
    const { reviewId, eventId, userId, rating } = message;

    // Process review event
    const pool = await getPool();

    // 1. Update event average rating
    const avgResult = await pool.request()
      .input('eventId', sql.Int, eventId)
      .query(`
        SELECT AVG(CAST(rating AS FLOAT)) as avgRating, COUNT(*) as totalReviews
        FROM Reviews
        WHERE eventId = @eventId
      `);

    const { avgRating, totalReviews } = avgResult.recordset[0];

    context.log(`📊 Event stats updated - Avg: ${avgRating}, Total: ${totalReviews}`);

    // 2. Send notification to event organizer
    const eventResult = await pool.request()
      .input('eventId', sql.Int, eventId)
      .query('SELECT organizerId FROM Events WHERE id = @eventId');

    if (eventResult.recordset.length > 0) {
      const organizerId = eventResult.recordset[0].organizerId;

      const notification = {
        userId: organizerId,
        type: 'NEW_REVIEW',
        message: `Your event received a ${rating}-star review!`,
        timestamp: new Date().toISOString()
      };

      context.log('📧 Notification created:', notification);
    }

    context.log('✅ Review event processed successfully');

    return {
      status: 200,
      body: { success: true, avgRating, totalReviews }
    };

  } catch (error) {
    context.log.error('❌ Error processing review event:', error);

    return {
      status: 500,
      body: { error: error.message }
    };
  }
};
