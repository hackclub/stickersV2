import { redirect } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/admin';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/');
	if (!locals.user.onboarded_at && !isAdmin(locals.user.hca_id)) throw redirect(302, '/onboarding');
	return { user: locals.user, isAdmin: isAdmin(locals.user.hca_id) };
};
