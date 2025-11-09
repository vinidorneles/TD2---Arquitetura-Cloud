/**
 * EVENT CONSUMER (Event-Driven Architecture)
 *
 * Consumes domain events from message broker
 * Implements Publisher-Subscriber pattern
 */

const amqp = require('amqplib');

class EventConsumer {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchange = 'vibra_events';
    this.handlers = new Map();
  }

  async connect() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://vibra:vibra123@localhost:5672';

      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Declare exchange (must match publisher)
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

      console.log(`✅ EventConsumer connected to RabbitMQ: ${this.exchange}`);

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

  async subscribe(eventType, handler) {
    if (!this.channel) {
      console.error('⚠️  No RabbitMQ channel. Cannot subscribe to:', eventType);
      return;
    }

    try {
      // Create queue for this event type
      const queueName = `functions.${eventType}`;
      await this.channel.assertQueue(queueName, { durable: true });

      // Bind queue to exchange with routing key
      await this.channel.bindQueue(queueName, this.exchange, eventType);

      // Store handler
      this.handlers.set(eventType, handler);

      // Consume messages
      await this.channel.consume(queueName, async (msg) => {
        if (msg === null) return;

        try {
          const content = JSON.parse(msg.content.toString());
          console.log(`📥 Event received: ${eventType}`, { eventId: content.eventId });

          // Call handler
          await handler(content);

          // Acknowledge message
          this.channel.ack(msg);
          console.log(`✅ Event processed: ${eventType}`, { eventId: content.eventId });

        } catch (error) {
          console.error(`❌ Error processing event ${eventType}:`, error);
          // Reject and requeue message
          this.channel.nack(msg, false, true);
        }
      });

      console.log(`📬 Subscribed to: ${eventType}`);

    } catch (error) {
      console.error(`❌ Failed to subscribe to ${eventType}:`, error);
    }
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    console.log('✅ EventConsumer closed');
  }
}

// Singleton instance
let consumerInstance = null;

module.exports = {
  getConsumer: () => {
    if (!consumerInstance) {
      consumerInstance = new EventConsumer();
    }
    return consumerInstance;
  },
  EventConsumer
};
