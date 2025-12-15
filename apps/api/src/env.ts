import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const cwd = process.cwd();

const candidates = [
  path.resolve(cwd, '.env.local'),
  path.resolve(cwd, '.env'),
  path.resolve(cwd, '../../.env.local'),
  path.resolve(cwd, '../../.env'),
];

for (const envPath of candidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}
