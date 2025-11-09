/**
 * EVENT HANDLERS (Event-Driven Architecture)
 *
 * Handlers for domain events consumed from message broker
 */

const { getPool, sql } = require('../config/database');

class EventHandlers {
  // Handle event.created
  static async handleEventCreated(event) {
    console.log('🎉 Processing event.created:', event.data);

    try {
      // Example: Send notification to followers of organizer
      const notification = {
        userId: 'broadcast', // Send to all or specific users
        type: 'NEW_EVENT',
        message: `New event: ${event.data.name} in ${event.data.location}`,
        metadata: {
          eventId: event.data.eventId,
          category: event.data.category
        },
        createdAt: new Date()
      };

      console.log('📧 Notification created for new event:', notification);

      // Here you would:
      // - Save notification to database
      // - Send push notification
      // - Send email
      // - Update statistics

      return { success: true, notification };

    } catch (error) {
      console.error('❌ Error handling event.created:', error);
      throw error;
    }
  }

  // Handle review.created
  static async handleReviewCreated(event) {
    console.log('⭐ Processing review.created:', event.data);

    try {
      const pool = await getPool();

      // 1. Update event average rating
      const avgResult = await pool.request()
        .input('eventId', sql.Int, event.data.eventId)
        .query(`
          SELECT AVG(CAST(rating AS FLOAT)) as avgRating, COUNT(*) as totalReviews
          FROM Reviews
          WHERE eventId = @eventId
        `);

      const { avgRating, totalReviews } = avgResult.recordset[0];

      console.log(`📊 Event stats updated - Avg: ${avgRating}, Total: ${totalReviews}`);

      // 2. Send notification to event organizer
      const eventResult = await pool.request()
        .input('eventId', sql.Int, event.data.eventId)
        .query('SELECT organizerId FROM Events WHERE id = @eventId');

      if (eventResult.recordset.length > 0) {
        const organizerId = eventResult.recordset[0].organizerId;

        const notification = {
          userId: organizerId,
          type: 'NEW_REVIEW',
          message: `Your event received a ${event.data.rating}-star review!`,
          metadata: {
            eventId: event.data.eventId,
            reviewId: event.data.reviewId,
            rating: event.data.rating
          }
        };

        console.log('📧 Notification sent to organizer:', notification);
      }

      return { success: true, avgRating, totalReviews };

    } catch (error) {
      console.error('❌ Error handling review.created:', error);
      throw error;
    }
  }

  // Handle interest.marked
  static async handleInterestMarked(event) {
    console.log('👍 Processing interest.marked:', event.data);

    try {
      const pool = await getPool();

      // Count total interested/going
      const countResult = await pool.request()
        .input('eventId', sql.Int, event.data.eventId)
        .query(`
          SELECT
            SUM(CASE WHEN status = 'interested' THEN 1 ELSE 0 END) as totalInterested,
            SUM(CASE WHEN status = 'going' THEN 1 ELSE 0 END) as totalGoing
          FROM EventInterest
          WHERE eventId = @eventId
        `);

      const { totalInterested, totalGoing } = countResult.recordset[0];

      console.log(`📊 Event interest stats - Interested: ${totalInterested}, Going: ${totalGoing}`);

      // Send notification to event organizer
      const eventResult = await pool.request()
        .input('eventId', sql.Int, event.data.eventId)
        .query('SELECT organizerId FROM Events WHERE id = @eventId');

      if (eventResult.recordset.length > 0) {
        const organizerId = eventResult.recordset[0].organizerId;

        const notification = {
          userId: organizerId,
          type: 'NEW_INTEREST',
          message: `Someone marked "${event.data.status}" for your event!`,
          metadata: {
            eventId: event.data.eventId,
            status: event.data.status,
            totalInterested,
            totalGoing
          }
        };

        console.log('📧 Notification sent to organizer:', notification);
      }

      return { success: true, totalInterested, totalGoing };

    } catch (error) {
      console.error('❌ Error handling interest.marked:', error);
      throw error;
    }
  }
}

module.exports = EventHandlers;
