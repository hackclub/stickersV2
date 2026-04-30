export type OrderStatus = 'received' | 'packed' | 'courier' | 'delivered' | 'cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
	'received',
	'packed',
	'courier',
	'delivered',
	'cancelled'
];
