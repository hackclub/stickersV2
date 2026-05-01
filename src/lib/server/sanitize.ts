const CONTROL_LINE = /[\x00-\x1f\x7f-\x9f]/g;
const CONTROL_MULTILINE = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/g;

const URL_MAX = 2048;
const EMAIL_MAX = 254;

export function cleanLine(value: unknown, max: number): string {
	if (typeof value !== 'string') return '';
	return value.replace(CONTROL_LINE, '').trim().slice(0, max);
}

export function cleanMultiline(value: unknown, max: number): string {
	if (typeof value !== 'string') return '';
	return value.replace(CONTROL_MULTILINE, '').trim().slice(0, max);
}

export function cleanUrl(value: unknown, max = URL_MAX): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.replace(CONTROL_LINE, '').trim().slice(0, max);
	if (!trimmed) return null;
	let parsed: URL;
	try {
		parsed = new URL(trimmed);
	} catch {
		return null;
	}
	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
	return parsed.toString();
}

export function cleanHref(value: unknown, max = URL_MAX): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.replace(CONTROL_LINE, '').trim().slice(0, max);
	if (!trimmed) return null;
	if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
	return cleanUrl(trimmed, max);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanEmail(value: unknown, max = EMAIL_MAX): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.replace(CONTROL_LINE, '').trim().slice(0, max);
	if (!trimmed || !EMAIL_RE.test(trimmed)) return null;
	return trimmed;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function cleanIsoDate(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!ISO_DATE_RE.test(trimmed)) return null;
	const d = new Date(`${trimmed}T00:00:00Z`);
	if (Number.isNaN(d.getTime())) return null;
	return trimmed;
}
