require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const fs           = require('fs');
const db           = require('./db/database');
const authRouter      = require('./routes/auth');
const postsRouter     = require('./routes/posts');
const ideasRouter     = require('./routes/ideas');
const analyticsRouter = require('./routes/analytics');
const errorHandler    = require('./middleware/errorHandler');

const app = express();

// Apply schema on startup
const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
db.exec(schema);

// Auto-seed if database is empty (handles Render ephemeral filesystem)
const { count } = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (count === 0) {
  console.log('Empty database detected — seeding demo data...');
  require('./db/seed');
  console.log('Seed complete.');
}

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth',      authRouter);
app.use('/api/posts',     postsRouter);
app.use('/api/ideas',     ideasRouter);
app.use('/api/analytics', analyticsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Kiara Planner API is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\nKiara Planner server running at http://localhost:${PORT}`);
  console.log('\nRoutes available:');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  GET    /api/auth/me');
  console.log('  POST   /api/auth/logout');
  console.log('  ---');
  console.log('  GET    /api/posts               ?platform= &status= &month=YYYY-MM');
  console.log('  GET    /api/posts/:id');
  console.log('  POST   /api/posts');
  console.log('  PUT    /api/posts/:id');
  console.log('  DELETE /api/posts/:id');
  console.log('  PATCH  /api/posts/:id/status');
  console.log('  ---');
  console.log('  GET    /api/ideas               ?mood= &platform= &keyword=');
  console.log('  POST   /api/ideas');
  console.log('  PUT    /api/ideas/:id');
  console.log('  DELETE /api/ideas/:id');
  console.log('  PATCH  /api/ideas/:id/favorite');
  console.log('  POST   /api/ideas/:id/convert');
  console.log('  ---');
  console.log('  GET    /api/analytics/summary');
  console.log('  GET    /api/analytics/heatmap   ?month=YYYY-MM');
  console.log('  GET    /api/health');
});

module.exports = app;
