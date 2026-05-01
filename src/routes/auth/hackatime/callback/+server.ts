import { error, redirect } from '@sveltejs/kit';
import {
	HACKATIME_STATE_COOKIE,
	exchangeHackatimeCode,
	fetchHackatimeMe,
	saveHackatimeConnection,
	verifyState
} from '$lib/server/hackatime';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
	if (!locals.user) throw redirect(303, '/');

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const expectedState = cookies.get(HACKATIME_STATE_COOKIE);
	cookies.delete(HACKATIME_STATE_COOKIE, { path: '/auth/hackatime/callback' });

	if (!code) throw error(400, 'Missing code');
	if (!state || !expectedState || state !== expectedState) {
		throw error(400, 'Invalid state');
	}
	if (!verifyState(state, locals.user.id)) {
		throw error(400, 'State does not match this user');
	}

	const tokens = await exchangeHackatimeCode(url.origin, code);

	let me;
	try {
		me = await fetchHackatimeMe(url.origin, tokens.access_token);
	} catch {
		throw error(502, 'Could not verify Hackatime identity');
	}
	const rawId = me.id ?? me.user_id ?? null;
	if (rawId === null || rawId === undefined) {
		throw error(502, 'Hackatime did not return a user id');
	}
	const hackatimeUid = String(rawId);

	await saveHackatimeConnection(locals.user.id, tokens.access_token, hackatimeUid);

	throw redirect(303, '/onboarding/connect');
};
