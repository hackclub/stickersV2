import { AIRTABLE_PAT, AIRTABLE_BASE_ID } from '$env/static/private';
import Airtable from 'airtable';
import { db } from '$lib/server/db';
import { stickers } from '$lib/server/db/schema';

type StickerFields = {
	'Sticker Name': string;
	'CDN_URL': string;
	'Artist': string;
	'Event': string;
	'event_URL': string;
	'Sheet': boolean;
	'Shiny': boolean;
};

const table = new Airtable({ apiKey: AIRTABLE_PAT }).base(AIRTABLE_BASE_ID)<StickerFields>('stickerDB');

function fetchAllStickers(): Promise<Airtable.Record<StickerFields>[]> {
	return new Promise((resolve, reject) => {
		const records: Airtable.Record<StickerFields>[] = [];
		table.select().eachPage(
			(page, next) => { records.push(...page); next(); },
			(err) => err ? reject(err) : resolve(records)
		);
	});
}

export async function syncAirtableToPostgres() {
	const records = await fetchAllStickers();

	const values = records
		.map(r => ({
			name: r.get('Sticker Name') as string | undefined,
			cdn_url: r.get('CDN_URL') as string | undefined,
			artist: r.get('Artist') as string | undefined,
			event: r.get('Event') as string | undefined,
			event_url: r.get('event_URL') as string | undefined,
			sheet: (r.get('Sheet') ?? false) as boolean,
			shiny: (r.get('Shiny') ?? false) as boolean,
		}))
		.filter((v): v is typeof v & { name: string; cdn_url: string } =>
			typeof v.name === 'string' && typeof v.cdn_url === 'string'
		);

	await db.transaction(async (tx) => {
		await tx.delete(stickers);
		await tx.insert(stickers).values(values);
	});

	console.log(`Synced ${values.length} stickers`);
}
