import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres({
	host: '/tmp',
	database: 'lang',
	username: 'ab'
});
export const db = drizzle(client, { schema });
