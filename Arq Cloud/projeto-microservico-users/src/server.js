require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3001;

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 VIBRA Users Service running on port ${PORT}`);
  console.log(`📚 API Documentation: http:
  console.log(`💚 Health check: http:
});
