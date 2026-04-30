import { pgTable, serial, boolean, text } from 'drizzle-orm/pg-core';

export const stickers = pgTable('stickers', {
	id: serial('id').primaryKey(),
	name: text('Sticker Name').notNull(),
	cdn_url: text('CDN_URL').notNull(),
	artist: text('Artist'),
	event: text('Event'),
	event_url: text('event_URL'),
	sheet: boolean('Sheet'),
	shiny: boolean('Shiny')
});
