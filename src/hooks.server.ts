import { Cron } from 'croner';
import { syncAirtableToPostgres } from '$lib/server/sync';
import { dev } from '$app/environment';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { SESSION_COOKIE, getStoredUserFromSession } from '$lib/server/session';
import { toPublicUser } from '$lib/server/db/schema';

if (!dev) {
	const sync = async () => {
		try {
			await syncAirtableToPostgres();
		} catch (err) {
			console.error('[Sync Error]', err);
		}
	};

	sync();
	new Cron('0 */12 * * *', sync);
}

export const handle: Handle = async ({ event, resolve }) => {
	const stored = await getStoredUserFromSession(event.cookies.get(SESSION_COOKIE));
	event.locals.user = stored ? toPublicUser(stored) : null;
	return resolve(event);
};

export const handleError: HandleServerError = ({ error, event, status }) => {
	const id = crypto.randomUUID();
	const route = event.route?.id ?? event.url.pathname;
	const msg = error instanceof Error ? error.message : String(error);
	const safe = msg.split('\n')[0].slice(0, 500);
	console.error(`[err ${id}] ${status} ${route}: ${safe}`);
	return { message: 'Internal error', id };
};
