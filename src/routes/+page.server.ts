import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, setHeaders }) => {
	// The HTML carries the signed-in user's email when present; ensure no shared
	// cache (CDN/proxy/back-button) ever serves that response to a different visitor.
	setHeaders({ 'cache-control': 'private, no-store' });
	return { email: locals.user?.email ?? null };
};
