import { randomBytes } from 'node:crypto';
import { db } from '$lib/server/db';
import { sessions, users, type StoredUser } from '$lib/server/db/schema';
import { and, eq, gt } from 'drizzle-orm';
import type { Cookies } from '@sveltejs/kit';

export const SESSION_COOKIE = 'hc_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export async function createSession(userId: string): Promise<{ id: string; expiresAt: Date }> {
	const id = randomBytes(32).toString('base64url');
	const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
	await db.insert(sessions).values({ id, user_id: userId, expires_at: expiresAt });
	return { id, expiresAt };
}

export function setSessionCookie(cookies: Cookies, sessionId: string, expiresAt: Date, secure: boolean) {
	cookies.set(SESSION_COOKIE, sessionId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure,
		expires: expiresAt
	});
}

export async function getStoredUserFromSession(sessionId: string | undefined): Promise<StoredUser | null> {
	if (!sessionId) return null;
	const rows = await db
		.select({ user: users })
		.from(sessions)
		.innerJoin(users, eq(sessions.user_id, users.id))
		.where(and(eq(sessions.id, sessionId), gt(sessions.expires_at, new Date())))
		.limit(1);
	return rows[0]?.user ?? null;
}

export async function loadStoredUser(userId: string): Promise<StoredUser | null> {
	const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
	return rows[0] ?? null;
}

export async function destroySession(sessionId: string) {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}
