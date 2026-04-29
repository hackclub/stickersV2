import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { exchangeCode, fetchIdentity, upsertUserFromTokens } from '$lib/server/hcAuth';
import { createSession, setSessionCookie } from '$lib/server/session';

export async function GET({ url, cookies }) {
	const redirectUri = env.HC_AUTH_REDIRECT_URI ?? `${url.origin}/auth/callback`;

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const expectedState = cookies.get('hc_oauth_state');
	cookies.delete('hc_oauth_state', { path: '/auth/callback' });

	if (!code) throw error(400, 'Missing code');
	if (!state || state !== expectedState) throw error(400, 'Invalid state');

	const tokens = await exchangeCode(code, redirectUri);
	const me = await fetchIdentity(tokens.access_token);
	const hcaId = me.identity?.id;
	if (!hcaId) throw error(502, 'Identity missing id');

	const user = await upsertUserFromTokens(tokens, hcaId, me.identity.primary_email ?? undefined);

	const session = await createSession(user.id);
	setSessionCookie(cookies, session.id, session.expiresAt, url.protocol === 'https:');

	throw redirect(302, '/home');
}
