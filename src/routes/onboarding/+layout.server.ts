import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/');
	if (locals.user.onboarded_at) throw redirect(302, '/home');
	return { user: locals.user };
};
