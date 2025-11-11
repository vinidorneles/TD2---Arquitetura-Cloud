const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'VIBRA BFF Gateway API',
    version: '1.0.0',
    description: 'Backend for Frontend - Aggregation, Proxy and Orchestration layer for VIBRA event platform',
    contact: {
      name: 'VIBRA Team',
      email: 'contato@vibra.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server (BFF Gateway)'
    },
    {
      url: 'https://vibra-bff.azurewebsites.net',
      description: 'Production server (Azure)'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Error message'
          },
          error: {
            type: 'object',
            description: 'Error details (only in development)'
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          profilePicture: { type: 'string' }
        }
      },
      Event: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          location: {
            type: 'object',
            properties: {
              address: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              country: { type: 'string' },
              lat: { type: 'number' },
              lng: { type: 'number' }
            }
          },
          category: { type: 'string' },
          capacity: { type: 'number' },
          ticketPrice: { type: 'number' }
        }
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js', './src/app.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
