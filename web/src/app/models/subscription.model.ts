export interface Subscription {
	id: string;
	name: string;
	isUserApproved: boolean;
	frequency: string;
	dayOfMonth: number | null;
	month: number | null;
	amount: number;
	userId: string;
	itemId: string | null;
}
