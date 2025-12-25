import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

const client = postgres({
	host: env.DB_HOST ?? '/tmp',
	database: env.DB_NAME ?? 'translations',
	username: env.DB_USER ?? 'ab'
});
export const db = drizzle(client, { schema });
