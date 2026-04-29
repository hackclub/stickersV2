import { db } from '$lib/server/db';
import { users, type StoredUser } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { decryptToken, encryptToken, hashToken } from '$lib/server/crypto';
import { env } from '$env/dynamic/private';

const TOKEN_URL = 'https://auth.hackclub.com/oauth/token';
const ME_URL = 'https://auth.hackclub.com/api/v1/me';

const REFRESH_LEEWAY_MS = 60_000;

type TokenResponse = {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	scope?: string;
	token_type: string;
};

export type HcAddress = {
	id?: string;
	first_name?: string | null;
	last_name?: string | null;
	line_1?: string | null;
	line_2?: string | null;
	city?: string | null;
	state?: string | null;
	postal_code?: string | null;
	country?: string | null;
	[k: string]: unknown;
};

export type HcIdentity = {
	id: string;
	ysws_eligible?: boolean;
	verification_status?: string;
	first_name?: string | null;
	last_name?: string | null;
	primary_email?: string | null;
	slack_id?: string | null;
	phone_number?: string | null;
	birthday?: string | null;
	legal_first_name?: string | null;
	legal_last_name?: string | null;
	addresses?: HcAddress[];
	[k: string]: unknown;
};

export type HcMeResponse = {
	identity: HcIdentity;
	scopes: string[];
};

function clientCreds() {
	const clientId = env.HC_AUTH_CLIENT_ID;
	const clientSecret = env.HC_AUTH_CLIENT_SECRET;
	if (!clientId || !clientSecret) throw new Error('Hack Club auth is not configured');
	return { clientId, clientSecret };
}

export async function exchangeCode(code: string, redirectUri: string): Promise<TokenResponse> {
	const { clientId, clientSecret } = clientCreds();
	const res = await fetch(TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: redirectUri,
			client_id: clientId,
			client_secret: clientSecret
		})
	});
	if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
	return (await res.json()) as TokenResponse;
}

async function refresh(refreshToken: string): Promise<TokenResponse> {
	const { clientId, clientSecret } = clientCreds();
	const res = await fetch(TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken,
			client_id: clientId,
			client_secret: clientSecret
		})
	});
	if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
	return (await res.json()) as TokenResponse;
}

export async function fetchIdentity(accessToken: string): Promise<HcMeResponse> {
	const res = await fetch(ME_URL, { headers: { Authorization: `Bearer ${accessToken}` } });
	if (!res.ok) throw new Error(`Failed to fetch identity: ${res.status}`);
	return (await res.json()) as HcMeResponse;
}

export async function upsertUserFromTokens(tokens: TokenResponse, hcaId: string, email?: string) {
	const access = encryptToken(tokens.access_token);
	const refreshEnc = encryptToken(tokens.refresh_token);
	const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
	const accessHash = hashToken(tokens.access_token);

	const row = {
		hca_id: hcaId,
		email: email ?? null,
		access_token_ct: access.ct,
		access_token_iv: access.iv,
		access_token_tag: access.tag,
		access_token_hash: accessHash,
		refresh_token_ct: refreshEnc.ct,
		refresh_token_iv: refreshEnc.iv,
		refresh_token_tag: refreshEnc.tag,
		scope: tokens.scope ?? null,
		expires_at: expiresAt,
		updated_at: new Date()
	};

	try {
		const [user] = await db
			.insert(users)
			.values(row)
			.onConflictDoUpdate({ target: users.hca_id, set: row })
			.returning();
		return user;
	} catch (err) {
		throw new Error(`Failed to persist user: ${sanitizeDbError(err)}`);
	}
}

function sanitizeDbError(err: unknown): string {
	let cur: unknown = err;
	for (let i = 0; i < 5 && cur && typeof cur === 'object'; i++) {
		const e = cur as {
			code?: string;
			severity?: string;
			message?: string;
			table?: string;
			table_name?: string;
			column?: string;
			column_name?: string;
			constraint?: string;
			constraint_name?: string;
			routine?: string;
			cause?: unknown;
		};
		// Only print fields when this is a postgres-js error (has SQLSTATE `code`).
		// Drizzle wrappers don't have `code` and their `message` includes bind params.
		if (typeof e.code === 'string' && e.code.length > 0) {
			const parts = [
				e.severity,
				e.code,
				e.table ?? e.table_name,
				e.column ?? e.column_name,
				e.constraint ?? e.constraint_name,
				e.routine,
				e.message
			].filter(Boolean);
			return parts.join(' | ').slice(0, 400);
		}
		cur = e.cause;
	}
	return 'database error';
}

export async function getValidAccessToken(user: StoredUser): Promise<string> {
	if (user.expires_at.getTime() - REFRESH_LEEWAY_MS > Date.now()) {
		return decryptToken({
			ct: user.access_token_ct,
			iv: user.access_token_iv,
			tag: user.access_token_tag
		});
	}

	const refreshToken = decryptToken({
		ct: user.refresh_token_ct,
		iv: user.refresh_token_iv,
		tag: user.refresh_token_tag
	});
	const tokens = await refresh(refreshToken);

	const access = encryptToken(tokens.access_token);
	const refreshEnc = encryptToken(tokens.refresh_token);
	try {
		await db
			.update(users)
			.set({
				access_token_ct: access.ct,
				access_token_iv: access.iv,
				access_token_tag: access.tag,
				access_token_hash: hashToken(tokens.access_token),
				refresh_token_ct: refreshEnc.ct,
				refresh_token_iv: refreshEnc.iv,
				refresh_token_tag: refreshEnc.tag,
				scope: tokens.scope ?? user.scope,
				expires_at: new Date(Date.now() + tokens.expires_in * 1000),
				updated_at: new Date()
			})
			.where(eq(users.id, user.id));
	} catch (err) {
		throw new Error(`Failed to persist refreshed tokens: ${sanitizeDbError(err)}`);
	}

	return tokens.access_token;
}

export async function fetchAddresses(user: StoredUser): Promise<HcAddress[]> {
	const token = await getValidAccessToken(user);
	const res = await fetch(ME_URL, { headers: { Authorization: `Bearer ${token}` } });
	if (!res.ok) throw new Error(`Failed to fetch addresses: ${res.status}`);
	const me = (await res.json()) as HcMeResponse;
	return me.identity.addresses ?? [];
}
