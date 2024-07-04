import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { PlaidTransactionsService } from "@services/plaid-transactions.service";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { PlaidTransaction } from "src/app/models/transaction.model";

@Component({
	selector: "app-transactions",
	standalone: true,
	imports: [ButtonModule, TableModule, CommonModule],
	templateUrl: "./transactions.component.html",
	styles: ``,
})
export class TransactionsComponent implements OnInit {
	transactions: PlaidTransaction[] = [];
	constructor(private plaidTransactionsService: PlaidTransactionsService) {}

	ngOnInit(): void {
		this.plaidTransactionsService
			.getTransactions()
			.subscribe((data: PlaidTransaction[]) => {
				this.transactions = data;
			});
	}

	isVerified(transaction: PlaidTransaction): boolean {
		return transaction.authorized_date !== null;
	}
}
