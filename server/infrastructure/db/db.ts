import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to configure your PostgreSQL connection?",
  );
}

export const db = new Kysely({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});