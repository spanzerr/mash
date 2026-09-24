const express = require('express');

const router = express.Router();

router.get('/', async (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'cmmc-readiness-platform',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
