type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
	ok: boolean;
	remaining: number;
	resetAt: number;
};

export function rateLimit(key: string, max: number, windowMs: number): RateLimitResult {
	const now = Date.now();
	let b = buckets.get(key);
	if (!b || b.resetAt <= now) {
		b = { count: 0, resetAt: now + windowMs };
		buckets.set(key, b);
	}
	b.count += 1;
	const ok = b.count <= max;
	return { ok, remaining: Math.max(0, max - b.count), resetAt: b.resetAt };
}

setInterval(() => {
	const now = Date.now();
	for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
}, 60_000).unref?.();
