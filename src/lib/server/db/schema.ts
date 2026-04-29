import { pgTable, serial, boolean, text, timestamp, uuid } from 'drizzle-orm/pg-core';

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

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	hca_id: text('hca_id').notNull().unique(),
	email: text('email'),
	access_token_ct: text('access_token_ct').notNull(),
	access_token_iv: text('access_token_iv').notNull(),
	access_token_tag: text('access_token_tag').notNull(),
	access_token_hash: text('access_token_hash').notNull(),
	refresh_token_ct: text('refresh_token_ct').notNull(),
	refresh_token_iv: text('refresh_token_iv').notNull(),
	refresh_token_tag: text('refresh_token_tag').notNull(),
	scope: text('scope'),
	expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
	created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	user_id: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
	created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export type StoredUser = typeof users.$inferSelect;

export type PublicUser = {
	id: string;
	hca_id: string;
	email: string | null;
};

export function toPublicUser(u: StoredUser): PublicUser {
	return { id: u.id, hca_id: u.hca_id, email: u.email };
}
