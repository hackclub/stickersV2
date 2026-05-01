import { env } from '$env/dynamic/private';
import { EMAIL_RE } from '$lib/server/sanitize';

export type ProjectFields = {
	description: string;
	screenshot?: { url: string }[];
	email: string;
	birthday?: string;
	playable_url?: string;
	code_url?: string;
	address_line_1?: string;
	address_line_2?: string;
	city?: string;
	state_province?: string;
	country?: string;
	zip_postal_code?: string;
	first_name?: string;
	last_name?: string;
};

export type AirtableRecord<F> = {
	id: string;
	createdTime: string;
	fields: Partial<F>;
};

function config() {
	const apiKey = env.AIRTABLE_PAT;
	const baseId = env.AIRTABLE_BASE_ID;
	const table = env.AIRTABLE_PROJECTS_TABLE_ID ?? env.AIRTABLE_PROJECTS_TABLE ?? 'Projects';
	if (!apiKey || !baseId) throw new Error('Airtable is not configured');
	return { apiKey, baseId, table };
}

function tableUrl({ baseId, table }: { baseId: string; table: string }) {
	return `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
}

function escapeFormulaValue(v: string) {
	// Airtable filterByFormula values are wrapped in double-quotes by the caller.
	// Strip control chars/newlines (which can break formulas) and escape backslashes + quotes.
	return v
		.replace(/[\x00-\x1f\x7f-\x9f]/g, '')
		.replace(/\\/g, '\\\\')
		.replace(/"/g, '\\"');
}

export async function listProjectsForEmail(
	email: string
): Promise<AirtableRecord<ProjectFields>[]> {
	if (!EMAIL_RE.test(email) || email.length > 254) return [];
	const cfg = config();
	const params = new URLSearchParams({
		filterByFormula: `LOWER({email}) = "${escapeFormulaValue(email.toLowerCase())}"`,
		pageSize: '100'
	});
	const res = await fetch(`${tableUrl(cfg)}?${params.toString()}`, {
		headers: { Authorization: `Bearer ${cfg.apiKey}` }
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Airtable list failed (${res.status}): ${text}`);
	}
	const data = (await res.json()) as { records: AirtableRecord<ProjectFields>[] };
	return data.records ?? [];
}

export async function createProject(
	fields: ProjectFields
): Promise<AirtableRecord<ProjectFields>> {
	const cfg = config();
	const cleaned = Object.fromEntries(
		Object.entries(fields).filter(([, v]) => {
			if (v === null || v === undefined || v === '') return false;
			if (Array.isArray(v) && v.length === 0) return false;
			return true;
		})
	);
	const res = await fetch(tableUrl(cfg), {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${cfg.apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ records: [{ fields: cleaned }] })
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Airtable create failed (${res.status}): ${text}`);
	}
	const data = (await res.json()) as { records: AirtableRecord<ProjectFields>[] };
	return data.records[0];
}
