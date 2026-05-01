import { fail, redirect, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { stickers, users } from '$lib/server/db/schema';
import { SESSION_COOKIE, destroySession } from '$lib/server/session';
import { fetchSlackProfile } from '$lib/server/slack';
import type { PageServerLoad } from './$types';

const NICKNAME_MAX = 50;

export const load: PageServerLoad = async ({ locals }) => {
	const favoriteSticker = locals.user?.favorite_sticker_id
		? (
				await db
					.select({
						id: stickers.id,
						name: stickers.name,
						cdn_url: stickers.cdn_url,
						artist: stickers.artist
					})
					.from(stickers)
					.where(eq(stickers.id, locals.user.favorite_sticker_id))
					.limit(1)
			)[0] ?? null
		: null;

	let slack: { avatar_url: string | null; display_name: string | null } | null = null;
	if (locals.user) {
		slack = {
			avatar_url: locals.user.slack_avatar_url,
			display_name: locals.user.slack_display_name
		};
		// If we have a slack_id but no profile cached yet, fetch it now and persist.
		if (locals.user.slack_id && (!slack.avatar_url || !slack.display_name)) {
			const fetched = await fetchSlackProfile(locals.user.slack_id);
			if (fetched && (fetched.avatar || fetched.display_name)) {
				slack = { avatar_url: fetched.avatar, display_name: fetched.display_name };
				try {
					await db
						.update(users)
						.set({
							slack_avatar_url: fetched.avatar,
							slack_display_name: fetched.display_name,
							updated_at: new Date()
						})
						.where(eq(users.id, locals.user.id));
				} catch {
					// Non-fatal — render the freshly fetched values regardless.
				}
			}
		}
	}

	return { favoriteSticker, slack };
};

export const actions: Actions = {
	updateNickname: async ({ request, locals }) => {
		if (!locals.user) throw redirect(303, '/');

		const form = await request.formData();
		const raw = form.get('nickname');
		const nickname = typeof raw === 'string' ? raw.trim() : '';

		if (nickname.length > NICKNAME_MAX) {
			return fail(400, {
				action: 'nickname' as const,
				nickname: nickname.slice(0, 200),
				error: `nickname must be ${NICKNAME_MAX} characters or fewer`
			});
		}

		const next = nickname.length === 0 ? null : nickname;

		try {
			await db
				.update(users)
				.set({ nickname: next, updated_at: new Date() })
				.where(eq(users.id, locals.user.id));
		} catch {
			return fail(500, { action: 'nickname' as const, nickname, error: 'failed to save nickname' });
		}

		return { action: 'nickname' as const, nickname: next, saved: true };
	},

	updatePostalName: async ({ request, locals }) => {
		if (!locals.user) throw redirect(303, '/');

		const form = await request.formData();
		const enabled = form.get('use_postal_name') === 'on';
		const raw = form.get('postal_name');
		const postalName = typeof raw === 'string' ? raw.trim() : '';

		if (enabled && postalName.length > NICKNAME_MAX) {
			return fail(400, {
				action: 'postal' as const,
				postalName: postalName.slice(0, 200),
				error: `postal name must be ${NICKNAME_MAX} characters or fewer`
			});
		}

		const next = enabled && postalName.length > 0 ? postalName : null;

		try {
			await db
				.update(users)
				.set({ postal_name: next, updated_at: new Date() })
				.where(eq(users.id, locals.user.id));
		} catch {
			return fail(500, {
				action: 'postal' as const,
				postalName,
				error: 'failed to save postal name'
			});
		}

		return { action: 'postal' as const, postalName: next, saved: true };
	},

	logout: async ({ cookies }) => {
		const sessionId = cookies.get(SESSION_COOKIE);
		if (sessionId) {
			try {
				await destroySession(sessionId);
			} catch {
				// Session row may already be gone — fall through and still clear the cookie.
			}
		}
		cookies.delete(SESSION_COOKIE, { path: '/' });
		throw redirect(303, '/');
	}
};
