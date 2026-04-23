import Airtable from 'airtable';
import { AIRTABLE_PAT, AIRTABLE_BASE_ID } from '$env/static/private';

async function getAirtableStickers() {
	const base = new Airtable({ apiKey: AIRTABLE_PAT }).base(AIRTABLE_BASE_ID);
	const records = await base('stickers').select().all();
	return;
}

export async function syncAirtableToPostgres() {
	return;
}
