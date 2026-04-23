import { Cron } from 'croner';
import { syncAirtableToPostgres } from '$lib/server/sync';
import { dev } from '$app/environment';

if (!dev) {
	new Cron('0 0 * * *', async () => {
		try {
			await syncAirtableToPostgres();
		} catch (err) {
			console.error('[Cron Error]', err);
		}
	});
}
