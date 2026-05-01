import { db } from '$lib/server/db';
import { stickers, deals } from '$lib/server/db/schema';
import { asc, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const recentStickers = await db
		.select({
			id: stickers.id,
			name: stickers.name,
			cdn_url: stickers.cdn_url,
			artist: stickers.artist,
			event: stickers.event,
			sheet: stickers.sheet,
			shiny: stickers.shiny
		})
		.from(stickers)
		.orderBy(desc(stickers.id))
		.limit(12);

	const dealRows = await db.select().from(deals).orderBy(asc(deals.sort_order), asc(deals.id));

	return { recentStickers, deals: dealRows };
};
