import { Pool } from 'pg';

// Create a local PostgreSQL pool pointing to our port 5433 test instance
// We use kardovo_app_user (non-superuser) so PostgreSQL strictly evaluates Row Level Security (RLS) policies
export const pgTestPool = new Pool({
  host: '127.0.0.1',
  port: 5433,
  database: 'kardovo_test',
  user: 'kardovo_app_user',
  password: 'app_secret',
});

export async function executeQuery(text: string, params: unknown[] = []) {
  return pgTestPool.query(text, params);
}
