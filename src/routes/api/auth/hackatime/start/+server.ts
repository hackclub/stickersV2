import { redirect } from '@sveltejs/kit';
import {
	HACKATIME_STATE_COOKIE,
	buildAuthorizeUrl,
	newState
} from '$lib/server/hackatime';
import type { RequestHandler } from './$types';

// POST-only to avoid CSRF via cross-site links (sameSite:lax cookies still flow on top-level GET).
export const POST: RequestHandler = async ({ url, cookies, locals }) => {
	if (!locals.user) throw redirect(303, '/');

	const state = newState(locals.user.id);
	cookies.set(HACKATIME_STATE_COOKIE, state, {
		path: '/auth/hackatime/callback',
		httpOnly: true,
		sameSite: 'lax',
		secure: url.protocol === 'https:',
		maxAge: 600
	});

	throw redirect(303, buildAuthorizeUrl(url.origin, state));
};
