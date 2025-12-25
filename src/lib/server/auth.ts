import { hash, verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { sessions, users, type Session, type User } from './db/schema';

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function generateSessionId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export async function hashPassword(password: string): Promise<string> {
	return hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
	return verify(hash, password);
}

export async function createUser(email: string, password: string): Promise<User> {
	const passwordHash = await hashPassword(password);
	const [user] = await db.insert(users).values({ email, passwordHash }).returning();
	return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
	const [user] = await db.select().from(users).where(eq(users.email, email));
	return user;
}

export async function createSession(userId: string): Promise<Session> {
	const id = generateSessionId();
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
	const [session] = await db.insert(sessions).values({ id, userId, expiresAt }).returning();
	return session;
}

export async function validateSession(
	sessionId: string
): Promise<{ user: User; session: Session } | null> {
	const result = await db
		.select({ user: users, session: sessions })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId));

	if (result.length === 0) return null;

	const { user, session } = result[0];

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
		return null;
	}

	// Extend session if more than halfway through
	if (Date.now() >= session.expiresAt.getTime() - SESSION_DURATION_MS / 2) {
		const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);
		await db.update(sessions).set({ expiresAt: newExpiresAt }).where(eq(sessions.id, sessionId));
		session.expiresAt = newExpiresAt;
	}

	return { user, session };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}
