import { db } from '$lib/server/db';
import { stickers } from '$lib/server/db/schema';

export async function load() {
	const allStickers = await db.select({
		id: stickers.id,
		name: stickers.name,
		cdn_url: stickers.cdn_url,
		artist: stickers.artist,
		event: stickers.event,
		event_url: stickers.event_url,
		sheet: stickers.sheet,
		shiny: stickers.shiny
	}).from(stickers);

	return { stickers: allStickers };
}
