import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { stickers } from '$lib/server/db/schema';

type StickerFields = {
	'Sticker Name'?: string;
	CDN_URL?: string;
	Artist?: string;
	Event?: string;
	event_URL?: string;
	Sheet?: boolean;
	Shiny?: boolean;
};

type AirtableRecord = { id: string; fields: StickerFields };
type AirtableListResponse = { records: AirtableRecord[]; offset?: string };

const STICKER_TABLE = 'stickerDB';

function config() {
	const apiKey = env.AIRTABLE_PAT;
	const baseId = env.AIRTABLE_BASE_ID;
	if (!apiKey || !baseId) throw new Error('Airtable is not configured');
	return { apiKey, baseId };
}

async function fetchAllStickers(): Promise<AirtableRecord[]> {
	const { apiKey, baseId } = config();
	const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(STICKER_TABLE)}`;
	const records: AirtableRecord[] = [];
	let offset: string | undefined;
	do {
		const params = new URLSearchParams({ pageSize: '100' });
		if (offset) params.set('offset', offset);
		const res = await fetch(`${url}?${params.toString()}`, {
			headers: { Authorization: `Bearer ${apiKey}` }
		});
		if (!res.ok) {
			const text = await res.text();
			throw new Error(`Airtable list failed (${res.status}): ${text}`);
		}
		const data = (await res.json()) as AirtableListResponse;
		records.push(...data.records);
		offset = data.offset;
	} while (offset);
	return records;
}

export async function syncAirtableToPostgres() {
	const records = await fetchAllStickers();

	const values = records
		.map((r) => ({
			name: r.fields['Sticker Name'],
			cdn_url: r.fields.CDN_URL,
			artist: r.fields.Artist,
			event: r.fields.Event,
			event_url: r.fields.event_URL,
			sheet: r.fields.Sheet ?? false,
			shiny: r.fields.Shiny ?? false
		}))
		.filter(
			(v): v is typeof v & { name: string; cdn_url: string } =>
				typeof v.name === 'string' && typeof v.cdn_url === 'string'
		);

	if (values.length === 0) {
		console.warn('Skipping sticker sync: Airtable returned no valid records');
		return;
	}

	await db.transaction(async (tx) => {
		await tx.delete(stickers);
		await tx.insert(stickers).values(values);
	});

	console.log(`Synced ${values.length} stickers`);
}
