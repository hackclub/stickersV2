import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const ADMIN_HCA_IDS = new Set(
	(env.ADMIN_HCA_IDS ?? '')
		.split(',')
		.map((s) => s.trim())
		.filter((s) => s.length > 0)
);

export function isAdmin(hcaId: string | null | undefined): boolean {
	if (!hcaId) return false;
	return ADMIN_HCA_IDS.has(hcaId);
}

export function requireAdmin(locals: App.Locals): void {
	if (!isAdmin(locals.user?.hca_id)) error(403, 'forbidden');
}
