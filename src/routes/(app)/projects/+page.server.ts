import { fail, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import {
	createProject,
	listProjectsForEmail,
	type ProjectFields
} from '$lib/server/airtable';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { fetchIdentity, getValidAccessToken } from '$lib/server/hcAuth';
import {
	cleanEmail,
	cleanIsoDate,
	cleanLine,
	cleanMultiline,
	cleanUrl
} from '$lib/server/sanitize';
import type { PageServerLoad } from './$types';

const DESCRIPTION_MAX = 300;
const NAME_MAX = 100;
const ADDRESS_LINE_MAX = 200;
const CITY_MAX = 100;
const REGION_MAX = 100;
const COUNTRY_MAX = 100;
const POSTAL_MAX = 30;

type IdentityBits = {
	first_name: string | null;
	last_name: string | null;
	birthday: string | null;
	address_line_1: string | null;
	address_line_2: string | null;
	city: string | null;
	state_province: string | null;
	country: string | null;
	zip_postal_code: string | null;
};

function nullIfEmpty(s: string): string | null {
	return s.length > 0 ? s : null;
}

async function fetchIdentityBits(userId: string): Promise<IdentityBits> {
	const empty: IdentityBits = {
		first_name: null,
		last_name: null,
		birthday: null,
		address_line_1: null,
		address_line_2: null,
		city: null,
		state_province: null,
		country: null,
		zip_postal_code: null
	};

	const [stored] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
	if (!stored) return empty;

	try {
		const token = await getValidAccessToken(stored);
		const me = await fetchIdentity(token);
		const id = me.identity;
		const addr = id.addresses?.[0] ?? {};

		return {
			first_name: nullIfEmpty(
				cleanLine((id.first_name as string | null) ?? id.legal_first_name, NAME_MAX)
			),
			last_name: nullIfEmpty(
				cleanLine((id.last_name as string | null) ?? id.legal_last_name, NAME_MAX)
			),
			birthday: cleanIsoDate(id.birthday),
			address_line_1: nullIfEmpty(cleanLine(addr.line_1, ADDRESS_LINE_MAX)),
			address_line_2: nullIfEmpty(cleanLine(addr.line_2, ADDRESS_LINE_MAX)),
			city: nullIfEmpty(cleanLine(addr.city, CITY_MAX)),
			state_province: nullIfEmpty(cleanLine(addr.state, REGION_MAX)),
			country: nullIfEmpty(cleanLine(addr.country, COUNTRY_MAX)),
			zip_postal_code: nullIfEmpty(cleanLine(addr.postal_code, POSTAL_MAX))
		};
	} catch {
		return { ...empty, first_name: nullIfEmpty(cleanLine(stored.first_name, NAME_MAX)) };
	}
}

export const load: PageServerLoad = async ({ locals }) => {
	const email = cleanEmail(locals.user?.email);
	if (!email) return { projects: [], airtableError: null };

	try {
		const records = await listProjectsForEmail(email);
		return { projects: records, airtableError: null };
	} catch (err) {
		return { projects: [], airtableError: (err as Error).message };
	}
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const email = cleanEmail(locals.user?.email);
		const userId = locals.user?.id;
		if (!email || !userId) return fail(401, { error: 'not signed in' });

		const fd = await request.formData();
		const description = cleanMultiline(fd.get('description'), DESCRIPTION_MAX);
		const codeUrlRaw = String(fd.get('code_url') ?? '');
		const playableUrlRaw = String(fd.get('playable_url') ?? '');
		const screenshot1Raw = String(fd.get('screenshot1') ?? '');
		const screenshot2Raw = String(fd.get('screenshot2') ?? '');

		const codeUrl = cleanUrl(codeUrlRaw);
		const playableUrl = cleanUrl(playableUrlRaw);
		const screenshot1 = cleanUrl(screenshot1Raw);
		const screenshot2 = cleanUrl(screenshot2Raw);

		const errors: Record<string, string> = {};
		if (!description) errors.description = 'description is required';
		if (codeUrlRaw.trim() && !codeUrl) errors.code_url = 'must be a valid http(s) URL';
		if (playableUrlRaw.trim() && !playableUrl)
			errors.playable_url = 'must be a valid http(s) URL';
		if (screenshot1Raw.trim() && !screenshot1)
			errors.screenshot1 = 'must be a valid http(s) URL';
		if (screenshot2Raw.trim() && !screenshot2)
			errors.screenshot2 = 'must be a valid http(s) URL';

		const values = {
			description,
			codeUrl: codeUrlRaw,
			playableUrl: playableUrlRaw,
			screenshot1: screenshot1Raw,
			screenshot2: screenshot2Raw
		};
		if (Object.keys(errors).length > 0) return fail(400, { errors, values });

		const screenshots = [screenshot1, screenshot2]
			.filter((u): u is string => !!u)
			.map((url) => ({ url }));

		const id = await fetchIdentityBits(userId);

		const fields: ProjectFields = {
			description,
			email,
			code_url: codeUrl ?? undefined,
			playable_url: playableUrl ?? undefined,
			screenshot: screenshots.length > 0 ? screenshots : undefined,
			first_name: id.first_name ?? undefined,
			last_name: id.last_name ?? undefined,
			birthday: id.birthday ?? undefined,
			address_line_1: id.address_line_1 ?? undefined,
			address_line_2: id.address_line_2 ?? undefined,
			city: id.city ?? undefined,
			state_province: id.state_province ?? undefined,
			country: id.country ?? undefined,
			zip_postal_code: id.zip_postal_code ?? undefined
		};

		try {
			await createProject(fields);
		} catch (err) {
			return fail(502, { error: (err as Error).message, values });
		}

		return { success: true };
	}
};
