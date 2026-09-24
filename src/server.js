require('dotenv').config();

const app = require('./app');
const { env } = require('./config/env');

const port = env.PORT || 4000;

app.listen(port, () => {
  console.log(`CMMC readiness API listening on http://localhost:${port}`);
});
