require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 VIBRA BFF Gateway running on port ${PORT}`);
  console.log(`💚 Health check: http:
  console.log(`\n🔗 Connected Services:`);
  console.log(`   Users Service: ${process.env.USERS_SERVICE_URL}`);
  console.log(`   Events Service: ${process.env.EVENTS_SERVICE_URL}`);
  console.log(`   Functions Service: ${process.env.FUNCTIONS_SERVICE_URL}`);
  console.log(`\n📡 Key Endpoints:`);
  console.log(`   Dashboard (Aggregation): GET /api/dashboard`);
  console.log(`   Create Review via Event: POST /api/events/:id/reviews/event`);
  console.log(`   Nearby Events: GET /api/events/nearby`);
  console.log(`   Global Search: GET /api/search?q=query`);
});
