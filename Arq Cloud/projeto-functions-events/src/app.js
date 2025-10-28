const express = require('express');
const cors = require('cors');

const createReviewEvent = require('./functions/createReviewEvent');
const { sendNotification, getUserNotifications } = require('./functions/sendNotification');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'VIBRA Functions Service',
    timestamp: new Date().toISOString(),
    functions: [
      'POST /api/functions/review-event - Create review via event',
      'POST /api/functions/notification - Send notification',
      'GET /api/functions/notifications/:userId - Get user notifications'
    ]
  });
});

app.post('/api/functions/review-event', createReviewEvent);
app.post('/api/functions/notification', sendNotification);
app.get('/api/functions/notifications/:userId', getUserNotifications);

app.get('/', (req, res) => {
  res.json({
    service: 'VIBRA Functions Service',
    version: '1.0.0',
    description: 'Serverless functions for event processing',
    endpoints: {
      health: 'GET /health',
      reviewEvent: 'POST /api/functions/review-event',
      notification: 'POST /api/functions/notification',
      getUserNotifications: 'GET /api/functions/notifications/:userId'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Função não encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
