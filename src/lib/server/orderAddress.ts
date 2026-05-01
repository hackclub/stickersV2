import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { orders, type StoredUser } from '$lib/server/db/schema';
import { fetchAddresses, type HcAddress } from '$lib/server/hcAuth';
import { decryptAddress, encryptAddress, type StoredAddress } from '$lib/server/crypto';

export function buildRecipientName(
	user: Pick<StoredUser, 'postal_name'>,
	address: Pick<HcAddress, 'first_name' | 'last_name'>
): string | null {
	const postal = user.postal_name?.trim();
	if (postal) return postal;
	const composed = [address.first_name, address.last_name]
		.filter((p): p is string => !!p && p.trim().length > 0)
		.join(' ')
		.trim();
	return composed || null;
}

export async function refreshStage1OrderAddresses(user: StoredUser): Promise<void> {
	const stage1 = await db
		.select({
			id: orders.id,
			address_ct: orders.address_ct,
			address_iv: orders.address_iv,
			address_tag: orders.address_tag
		})
		.from(orders)
		.where(and(eq(orders.user_id, user.id), eq(orders.status, 'received')));
	if (stage1.length === 0) return;

	let addresses;
	try {
		addresses = await fetchAddresses(user);
	} catch {
		return;
	}
	const a = addresses[0];
	if (!a) return;

	const fresh: StoredAddress = {
		recipient_name: buildRecipientName(user, a),
		line_1: a.line_1 ?? null,
		line_2: a.line_2 ?? null,
		city: a.city ?? null,
		state: a.state ?? null,
		postal_code: a.postal_code ?? null,
		country: a.country ?? null
	};
	const freshKey = JSON.stringify(fresh);

	for (const row of stage1) {
		const cur = decryptAddress({
			ct: row.address_ct,
			iv: row.address_iv,
			tag: row.address_tag
		});
		if (cur && JSON.stringify(cur) === freshKey) continue;
		const enc = encryptAddress(fresh);
		await db
			.update(orders)
			.set({
				address_ct: enc.ct,
				address_iv: enc.iv,
				address_tag: enc.tag,
				updated_at: new Date()
			})
			.where(eq(orders.id, row.id));
	}
}
