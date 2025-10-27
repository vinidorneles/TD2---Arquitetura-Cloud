const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

const eventRoutes = require('./routes/eventRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const interestRoutes = require('./routes/interestRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
const swaggerFile = fs.readFileSync(path.join(__dirname, '../swagger.yaml'), 'utf8');
const swaggerDocument = YAML.parse(swaggerFile);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'VIBRA Events Service',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/events', eventRoutes);
app.use('/api', reviewRoutes);
app.use('/api', interestRoutes);

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
