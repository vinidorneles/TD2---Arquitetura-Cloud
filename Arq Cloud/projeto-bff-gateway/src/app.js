const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'VIBRA BFF Gateway',
    timestamp: new Date().toISOString(),
    services: {
      users: process.env.USERS_SERVICE_URL,
      events: process.env.EVENTS_SERVICE_URL,
      functions: process.env.FUNCTIONS_SERVICE_URL
    }
  });
});

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'VIBRA BFF Gateway',
    version: '1.0.0',
    description: 'Backend for Frontend - Aggregation, Proxy and Orchestration',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        social: 'POST /api/auth/social'
      },
      aggregation: {
        dashboard: 'GET /api/dashboard',
        eventDetails: 'GET /api/events/:id/details',
        nearbyEvents: 'GET /api/events/nearby',
        friendActivities: 'GET /api/friends/:friendId/activities',
        search: 'GET /api/search?q=query'
      },
      proxy: {
        users: 'GET /api/users',
        events: 'GET /api/events',
        reviews: 'GET /api/events/:eventId/reviews',
        reviewViaEvent: 'POST /api/events/:eventId/reviews/event',
        notifications: 'GET /api/notifications'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
