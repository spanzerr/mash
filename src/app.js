const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const healthRouter = require('./routes/health');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({
    name: 'CMMC Readiness Platform',
    version: '0.1.0',
    status: 'bootstrapped'
  });
});

app.use('/health', healthRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Unexpected error'
  });
});

module.exports = app;
