import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { stickers } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ url }) {
	const lfName = url.searchParams.get('sticker') ?? 'all';

	if (lfName == 'all') {
		const allStickers = await db
			.select({
				id: stickers.id,
				name: stickers.name,
				cdn_url: stickers.cdn_url,
				artist: stickers.artist,
				event: stickers.event,
				event_url: stickers.event_url,
				sheet: stickers.sheet,
				shiny: stickers.shiny
			})
			.from(stickers);
		return json(allStickers);
	} else {
		const stickerSearch = await db
			.select()
			.from(stickers)
			.where(eq(stickers.name, lfName))
			.limit(1);

		if (!stickerSearch) {
			return json({ error: 'Sticker not found' }, { status: 404 });
		}

		return json(stickerSearch);
	}
}
