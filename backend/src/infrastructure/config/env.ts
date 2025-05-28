import { config } from 'dotenv';
import path from 'path';

const rootEnv = path.resolve(process.cwd(), '../.env');
const rootEnvLocal = path.resolve(process.cwd(), '../.env.local');

config({ path: rootEnv });
config({ path: rootEnvLocal, override: true });