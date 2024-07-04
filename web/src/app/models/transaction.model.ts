interface Account {
	name: string;
	item: {
		bank_name: string;
	};
}

export interface PlaidTransaction {
	id: string;
	user_id: string;
	account_id: string;
	category: string;
	date: string;
	authorized_date: string | null;
	name: string;
	amount: number;
	currency_code: string;
	is_removed: boolean;
	account: Account;
	account_name: string;
	bank_name: string;
}
