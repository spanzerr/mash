const { execSync } = require('child_process');
const path = require('path');
const { env } = require('../config/env');

const validCommands = ['up', 'down', 'status'];
const command = process.argv[2] || 'up';

if (!validCommands.includes(command)) {
  console.error(`Unknown migration command: ${command}. Use one of: ${validCommands.join(', ')}`);
  process.exit(1);
}

const migrationDir = path.join(__dirname, 'migrations');
const databaseUrl = env.DATABASE_URL;

try {
  execSync(
    `npx node-pg-migrate ${command} --migrations-dir ${migrationDir} --database-url "${databaseUrl}"`,
    {
      stdio: 'inherit'
    }
  );
} catch (error) {
  console.error('Migration command failed:', error.message);
  process.exit(1);
}
