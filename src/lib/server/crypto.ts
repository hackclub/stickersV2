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
