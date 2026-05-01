import { createHash } from 'node:crypto';

export const FREE_PACK_COUNT = 3;

export function pickFreePackIds(
	userId: string,
	allIds: number[],
	count = FREE_PACK_COUNT
): number[] {
	if (allIds.length <= count) return [...allIds];

	const arr = [...allIds].sort((a, b) => a - b);
	const seedBuf = createHash('sha256').update(userId).digest();
	let state = seedBuf.readUInt32BE(0);
	const next = () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state;
	};
	for (let i = arr.length - 1; i > 0; i--) {
		const j = next() % (i + 1);
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr.slice(0, count);
}
