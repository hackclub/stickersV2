import { syncAirtableToPostgres } from '$lib/server/sync';
import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';

export async function GET({ locals }) {
	requireAdmin(locals);
	try {
		await syncAirtableToPostgres();
		return json({ success: true, message: 'Sync triggered successfully' });
	} catch (err) {
		return json({ success: false, error: (err as Error).message }, { status: 500 });
	}
}
