import { Cron } from 'croner';
import { syncAirtableToPostgres } from '$lib/server/sync';
import { dev } from '$app/environment';

if (!dev) {
	const sync = async () => {
		try {
			await syncAirtableToPostgres();
		} catch (err) {
			console.error('[Sync Error]', err);
		}
	};

	sync();
	new Cron('0 0 * * *', sync);
}
