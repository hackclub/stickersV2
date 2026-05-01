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
	try {
		const stored = await getStoredUserFromSession(event.cookies.get(SESSION_COOKIE));
		event.locals.user = stored ? toPublicUser(stored) : null;
	} catch (err) {
		console.error('[session lookup failed]', err);
		event.locals.user = null;
	}
	return resolve(event);
};

export const handleError: HandleServerError = ({ error, event, status }) => {
	const id = crypto.randomUUID();
	const route = event.route?.id ?? event.url.pathname;
	console.error(`[err ${id}] ${status} ${route}:`, error);
	return { message: 'Internal error', id };
};
