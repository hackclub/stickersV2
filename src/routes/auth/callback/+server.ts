import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {
	HC_STATE_COOKIE,
	HC_STATE_COOKIE_PATH,
	exchangeCode,
	fetchIdentity,
	upsertUserFromTokens
} from '$lib/server/hcAuth';
import { fetchSlackProfile } from '$lib/server/slack';
import { createSession, setSessionCookie } from '$lib/server/session';

export async function GET({ url, cookies }) {
	const redirectUri = env.HC_AUTH_REDIRECT_URI ?? `${url.origin}/auth/callback`;

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const expectedState = cookies.get(HC_STATE_COOKIE);
	cookies.delete(HC_STATE_COOKIE, { path: HC_STATE_COOKIE_PATH });

	if (!code) throw error(400, 'Missing code');
	if (!state || state !== expectedState) throw error(400, 'Invalid state');

	const tokens = await exchangeCode(code, redirectUri);
	const me = await fetchIdentity(tokens.access_token);
	const hcaId = me.identity?.id;
	if (!hcaId) throw error(502, 'Identity missing id');

	const firstName =
		me.identity.first_name?.trim() || me.identity.legal_first_name?.trim() || null;
	const slackProfile = await fetchSlackProfile(me.identity.slack_id ?? null);
	const user = await upsertUserFromTokens(
		tokens,
		hcaId,
		me.identity.primary_email ?? undefined,
		firstName,
		me.identity.slack_id ?? null,
		slackProfile?.avatar ?? null,
		slackProfile?.display_name ?? null
	);

	const session = await createSession(user.id);
	setSessionCookie(cookies, session.id, session.expiresAt, url.protocol === 'https:');

	throw redirect(302, user.onboarded_at ? '/home' : '/onboarding');
}
