import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { env } from '$env/dynamic/private';

const ALGO = 'aes-256-gcm';

function getKey(): Buffer {
	const raw = env.TOKEN_ENCRYPTION_KEY;
	if (!raw) throw new Error('TOKEN_ENCRYPTION_KEY is not set');
	const key = Buffer.from(raw, 'base64');
	if (key.length !== 32)
		throw new Error('TOKEN_ENCRYPTION_KEY must decode to 32 bytes (base64-encoded 256-bit key)');
	return key;
}

export function encryptToken(plaintext: string): { ct: string; iv: string; tag: string } {
	const iv = randomBytes(12);
	const cipher = createCipheriv(ALGO, getKey(), iv);
	const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();
	return { ct: ct.toString('base64'), iv: iv.toString('base64'), tag: tag.toString('base64') };
}

export function decryptToken(parts: { ct: string; iv: string; tag: string }): string {
	const decipher = createDecipheriv(ALGO, getKey(), Buffer.from(parts.iv, 'base64'));
	decipher.setAuthTag(Buffer.from(parts.tag, 'base64'));
	const pt = Buffer.concat([decipher.update(Buffer.from(parts.ct, 'base64')), decipher.final()]);
	return pt.toString('utf8');
}

export function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export type StoredAddress = {
	recipient_name: string | null;
	line_1: string | null;
	line_2: string | null;
	city: string | null;
	state: string | null;
	postal_code: string | null;
	country: string | null;
};

export function encryptAddress(addr: StoredAddress): { ct: string; iv: string; tag: string } {
	return encryptToken(JSON.stringify(addr));
}

export function decryptAddress(parts: {
	ct: string | null;
	iv: string | null;
	tag: string | null;
}): StoredAddress | null {
	if (!parts.ct || !parts.iv || !parts.tag) return null;
	try {
		const json = decryptToken({ ct: parts.ct, iv: parts.iv, tag: parts.tag });
		const obj = JSON.parse(json) as Partial<StoredAddress>;
		return {
			recipient_name: obj.recipient_name ?? null,
			line_1: obj.line_1 ?? null,
			line_2: obj.line_2 ?? null,
			city: obj.city ?? null,
			state: obj.state ?? null,
			postal_code: obj.postal_code ?? null,
			country: obj.country ?? null
		};
	} catch {
		return null;
	}
}
