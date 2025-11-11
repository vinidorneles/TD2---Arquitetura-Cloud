const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const routes = require('./routes');

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use(limiter);

// Configure CORS to allow frontend origin(s). In development, include Vite default origin.
const rawCorsOrigins = process.env.CORS_ORIGIN || '';
const allowedOrigins = rawCorsOrigins ? rawCorsOrigins.split(',').map(s => s.trim()) : [];
if (process.env.NODE_ENV !== 'production') {
  // add vite dev server default origin for convenience
  if (!allowedOrigins.includes('http://localhost:5173')) allowedOrigins.push('http://localhost:5173');
}

const corsOptions = {
  origin: function (origin, callback) {
    // allow non-browser clients like curl/postman (no origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

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

app.use('/api', routes);

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

app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
