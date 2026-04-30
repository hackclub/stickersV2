import { syncAirtableToPostgres } from '$lib/server/sync';
import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';

export async function GET() {
	if (!dev) {
		return json({ success: false, error: 'Not available in production' }, { status: 403 });
	}
	try {
		await syncAirtableToPostgres();
		return json({ success: true, message: 'Sync triggered successfully' });
	} catch (err) {
		return json({ success: false, error: (err as Error).message }, { status: 500 });
	}
}
