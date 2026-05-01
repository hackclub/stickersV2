import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { decryptToken, encryptToken } from '$lib/server/crypto';

const DEFAULT_BASE_URL = 'https://hackatime.hackclub.com';
const SCOPES = 'profile read';

export const HACKATIME_STATE_COOKIE = 'hackatime_oauth_state';

type TokenResponse = {
	access_token: string;
	token_type?: string;
	scope?: string;
	expires_in?: number;
	refresh_token?: string;
};

type HackatimeMe = {
	id?: string | number;
	user_id?: string | number;
	trust_factor?: { trust_level?: string };
};

type Config = {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
	baseUrl: string;
};

function getConfig(origin: string): Config {
	const clientId = env.HACKATIME_CLIENT_ID;
	const clientSecret = env.HACKATIME_CLIENT_SECRET;
	if (!clientId || !clientSecret) throw new Error('Hackatime OAuth is not configured');

	const redirectUri = env.HACKATIME_REDIRECT_URI ?? `${origin}/auth/hackatime/callback`;
	const baseUrl = env.HACKATIME_BASE_URL ?? DEFAULT_BASE_URL;

	return { clientId, clientSecret, redirectUri, baseUrl };
}

function stateKey(): Buffer {
	const raw = env.TOKEN_ENCRYPTION_KEY;
	if (!raw) throw new Error('TOKEN_ENCRYPTION_KEY is not set');
	return Buffer.from(raw, 'base64');
}

function signState(nonce: string, userId: string): string {
	return createHmac('sha256', stateKey()).update(`${nonce}.${userId}`).digest('hex');
}

export function newState(userId: string): string {
	const nonce = randomBytes(24).toString('hex');
	return `${nonce}.${userId}.${signState(nonce, userId)}`;
}

export function verifyState(state: string, userId: string): boolean {
	const parts = state.split('.');
	if (parts.length !== 3) return false;
	const [nonce, embeddedUserId, sig] = parts;
	if (embeddedUserId !== userId) return false;
	const expected = signState(nonce, embeddedUserId);
	const a = Buffer.from(sig, 'hex');
	const b = Buffer.from(expected, 'hex');
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
}

export function buildAuthorizeUrl(origin: string, state: string): string {
	const cfg = getConfig(origin);
	const params = new URLSearchParams({
		client_id: cfg.clientId,
		redirect_uri: cfg.redirectUri,
		response_type: 'code',
		scope: SCOPES,
		state
	});
	return `${cfg.baseUrl}/oauth/authorize?${params.toString()}`;
}

export async function exchangeHackatimeCode(
	origin: string,
	code: string
): Promise<TokenResponse> {
	const cfg = getConfig(origin);
	const res = await fetch(`${cfg.baseUrl}/oauth/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: cfg.redirectUri,
			client_id: cfg.clientId,
			client_secret: cfg.clientSecret
		})
	});
	if (!res.ok) throw new Error(`Hackatime token exchange failed: ${res.status}`);
	const tokens = (await res.json()) as TokenResponse;
	if (!tokens.access_token) throw new Error('Hackatime token response missing access_token');
	return tokens;
}

export async function fetchHackatimeMe(origin: string, accessToken: string): Promise<HackatimeMe> {
	const cfg = getConfig(origin);
	const res = await fetch(`${cfg.baseUrl}/api/v1/authenticated/me`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	if (!res.ok) throw new Error(`Hackatime /me fetch failed: ${res.status}`);
	const body = (await res.json()) as { data?: HackatimeMe } & HackatimeMe;
	return body.data ?? body;
}

export async function saveHackatimeConnection(
	userId: string,
	accessToken: string,
	hackatimeUserId: string | null
): Promise<void> {
	const enc = encryptToken(accessToken);
	await db
		.update(users)
		.set({
			hackatime_token_ct: enc.ct,
			hackatime_token_iv: enc.iv,
			hackatime_token_tag: enc.tag,
			hackatime_user_id: hackatimeUserId,
			updated_at: new Date()
		})
		.where(eq(users.id, userId));
}

export function getHackatimeAccessToken(user: {
	hackatime_token_ct: string | null;
	hackatime_token_iv: string | null;
	hackatime_token_tag: string | null;
}): string | null {
	if (!user.hackatime_token_ct || !user.hackatime_token_iv || !user.hackatime_token_tag) {
		return null;
	}
	return decryptToken({
		ct: user.hackatime_token_ct,
		iv: user.hackatime_token_iv,
		tag: user.hackatime_token_tag
	});
}
