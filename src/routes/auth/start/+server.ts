import { redirect } from '@sveltejs/kit';
import { randomBytes } from 'node:crypto';
import { env } from '$env/dynamic/private';

const AUTHORIZE_URL = 'https://auth.hackclub.com/oauth/authorize';
const SCOPES = 'openid email name profile phone birthdate address verification_status slack_id basic_info';

export async function GET({ url, cookies }) {
	const clientId = env.HC_AUTH_CLIENT_ID;
	const redirectUri = env.HC_AUTH_REDIRECT_URI ?? `${url.origin}/auth/callback`;
	if (!clientId) throw new Error('HC_AUTH_CLIENT_ID is not set');

	const loginHint = url.searchParams.get('login_hint') ?? '';
	const state = randomBytes(24).toString('hex');

	cookies.set('hc_oauth_state', state, {
		path: '/auth/callback',
		httpOnly: true,
		sameSite: 'lax',
		secure: url.protocol === 'https:',
		maxAge: 600
	});

	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: SCOPES,
		state
	});
	if (loginHint) params.set('login_hint', loginHint);

	throw redirect(302, `${AUTHORIZE_URL}?${params.toString()}`);
}
