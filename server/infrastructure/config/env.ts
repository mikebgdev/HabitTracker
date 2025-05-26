import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

const cwd = process.cwd();

const envPath = path.resolve(cwd, '.env');
if (fs.existsSync(envPath)) {
  config({ path: envPath });
}

const envLocalPath = path.resolve(cwd, '.env.local');
if (fs.existsSync(envLocalPath)) {
  config({ path: envLocalPath, override: true });
}