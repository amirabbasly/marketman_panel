require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const leadRoutes = require('./routes/leads');
const statRoutes = require('./routes/stats');
const leagueRoutes = require('./routes/league');
const walletRoutes = require('./routes/wallet');
const accountingRoutes = require('./routes/accounting');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('fs').mkdirSync(path.join(__dirname, '../uploads/profiles'), { recursive: true });
require('fs').mkdirSync(path.join(__dirname, '../uploads/accounting'), { recursive: true });
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/league', leagueRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/accounting', accountingRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'marketman-backend' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'خطای سرور' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Marketman backend listening on port ${PORT}`);
});
