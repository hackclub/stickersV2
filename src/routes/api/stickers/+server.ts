import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { stickers } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { rateLimit } from '$lib/server/rateLimit';

const MAX_RANDOM_LIMIT = 50;
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

export async function GET({ url, getClientAddress }) {
	const ip = getClientAddress();
	const rl = rateLimit(`stickers:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
	if (!rl.ok) {
		const retryAfter = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
		return json(
			{ error: 'Too Many Requests' },
			{
				status: 429,
				headers: {
					'Retry-After': String(retryAfter),
					'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
					'X-RateLimit-Remaining': '0',
					'X-RateLimit-Reset': String(Math.ceil(rl.resetAt / 1000))
				}
			}
		);
	}

	const lfName = url.searchParams.get('sticker') ?? 'all';
	const parsedLimit = Number(url.searchParams.get('limit') ?? '1');
	const limit = Math.min(MAX_RANDOM_LIMIT, Math.max(1, Number.isFinite(parsedLimit) ? parsedLimit : 1));

	if (lfName === 'all') {
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
	} else if (lfName === 'random') {
		const randomSticker = await db
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
			.from(stickers)
			.orderBy(sql`RANDOM()`)
			.limit(limit);
		return json(limit === 1 ? randomSticker[0] : randomSticker);
	} else {
		const stickerSearch = await db
			.select()
			.from(stickers)
			.where(eq(stickers.name, lfName))
			.limit(1);

		if (stickerSearch.length === 0) {
			return json({ error: 'Sticker not found' }, { status: 404 });
		}

		return json(stickerSearch);
	}
}
