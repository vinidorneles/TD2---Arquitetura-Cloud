/**
 * EVENT PUBLISHER (Event-Driven Architecture)
 *
 * Publishes domain events to message broker (RabbitMQ or Azure Service Bus)
 * Implements Publisher-Subscriber pattern
 */

const amqp = require('amqplib');

class EventPublisher {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchange = 'vibra_events';
  }

  async connect() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://vibra:vibra123@localhost:5672';

      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Declare exchange (fanout = broadcast para todos subscribers)
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

      console.log(`✅ EventPublisher connected to RabbitMQ: ${this.exchange}`);

      // Handle connection errors
      this.connection.on('error', (err) => {
        console.error('❌ RabbitMQ connection error:', err);
      });

      this.connection.on('close', () => {
        console.log('⚠️  RabbitMQ connection closed. Reconnecting...');
        setTimeout(() => this.connect(), 5000);
      });

    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error.message);
      console.log('⏳ Retrying in 5 seconds...');
      setTimeout(() => this.connect(), 5000);
    }
  }

  async publish(eventType, eventData) {
    if (!this.channel) {
      console.warn('⚠️  No RabbitMQ channel. Event not published:', eventType);
      return false;
    }

    try {
      const message = {
        eventId: this.generateEventId(),
        eventType,
        timestamp: new Date().toISOString(),
        data: eventData
      };

      const messageBuffer = Buffer.from(JSON.stringify(message));

      // Publish to exchange with routing key (eventType)
      this.channel.publish(
        this.exchange,
        eventType,
        messageBuffer,
        { persistent: true }
      );

      console.log(`📤 Event published: ${eventType}`, { eventId: message.eventId });
      return true;

    } catch (error) {
      console.error(`❌ Failed to publish event ${eventType}:`, error);
      return false;
    }
  }

  async publishEventCreated(event) {
    return await this.publish('event.created', {
      eventId: event.id,
      name: event.name,
      organizerId: event.organizerId,
      category: event.category,
      location: event.location,
      startDate: event.startDate
    });
  }

  async publishReviewCreated(review) {
    return await this.publish('review.created', {
      reviewId: review.id,
      eventId: review.eventId,
      userId: review.userId,
      rating: review.rating
    });
  }

  async publishInterestMarked(interest) {
    return await this.publish('interest.marked', {
      eventId: interest.eventId,
      userId: interest.userId,
      status: interest.status
    });
  }

  generateEventId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    console.log('✅ EventPublisher closed');
  }
}

// Singleton instance
let publisherInstance = null;

module.exports = {
  getPublisher: () => {
    if (!publisherInstance) {
      publisherInstance = new EventPublisher();
    }
    return publisherInstance;
  },
  EventPublisher
};
