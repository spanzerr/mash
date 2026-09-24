const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { env } = require('./config/env');
const authRouter = require('./routes/auth');
const orgRouter = require('./routes/organizations');
const assessmentRouter = require('./routes/assessments');
const evidenceRouter = require('./routes/evidence');
const poamRouter = require('./routes/poam');
const documentRouter = require('./routes/documents');
const connectorRouter = require('./routes/connectors');
const healthRouter = require('./routes/health');

const app = express();

const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' }
});

const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI rate limit reached. Please try again shortly.' }
});

app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', apiRateLimit);

app.get('/', (_req, res) => {
  res.json({
    name: 'CMMC Readiness Platform',
    version: '0.1.0',
    status: 'operational'
  });
});

app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/organizations', orgRouter);
app.use('/api/assessments', assessmentRouter);
app.use('/api/evidence', evidenceRouter);
app.use('/api/poam', poamRouter);
app.use('/api/documents', documentRouter);
app.use('/api/connectors', connectorRouter);

app.use('/api/ai', aiRateLimit, (_req, res) => {
  res.status(404).json({ error: 'AI endpoint not mounted. Use /api/assessments/:id/ai-interview.' });
});

app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
    details: env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
