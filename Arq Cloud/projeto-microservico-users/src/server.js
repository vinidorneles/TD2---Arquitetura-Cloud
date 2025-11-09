require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3001;

connectDB();

// After DB connection, start server and ensure default admin exists (if configured)
const start = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`🚀 VIBRA Users Service running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/docs (if available)`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
    });

    // Lazy-require User model to avoid cyclic deps during boot
    const mongoose = require('mongoose');
    const User = require('./models/User');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      const existing = await User.findOne({ email: adminEmail.toLowerCase() });
      if (!existing) {
        const admin = new User({
          name: 'Admin',
          email: adminEmail.toLowerCase(),
          password: adminPassword,
          authProvider: 'local'
        });
        await admin.save();
        console.log(`✅ Admin user created: ${adminEmail}`);
      } else {
        console.log(`ℹ️ Admin user already exists: ${adminEmail}`);
      }
    } else {
      console.log('ℹ️ ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin seed');
    }
  } catch (err) {
    console.error('Failed to start server or seed admin:', err);
    process.exit(1);
  }
};

start();
