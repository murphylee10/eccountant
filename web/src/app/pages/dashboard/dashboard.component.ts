// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { ApiService } from "@services/api.service";
import { Component, type OnInit } from "@angular/core";
import type { SelectItem } from "primeng/api";
import { DropdownModule } from "primeng/dropdown";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { Router } from "@angular/router";
import type { PlaidTransaction } from "src/app/models/transaction.model"; // Make sure to import the model

@Component({
	selector: "app-dashboard",
	standalone: true,
	imports: [DropdownModule, FormsModule, CommonModule],
	templateUrl: "./dashboard.component.html",
	styles: "",
})
export class DashboardComponent implements OnInit {
	banks: SelectItem[] = [];
	selectedBankId = "";
	accounts: any[] = [];
	recentTransactions: PlaidTransaction[] = []; // Add a property for recent transactions

	constructor(
		private apiService: ApiService,
		private router: Router,
	) {}

	async ngOnInit() {
		await this.loadBanks();
		await this.loadRecentTransactions(); // Load recent transactions on init
	}

	async loadBanks() {
		const banksData = await this.apiService.getBanks();
		this.banks = banksData.map((bank) => ({
			label: bank.bank_name,
			value: bank.id,
		}));
		if (this.banks.length > 0) {
			this.selectedBankId = this.banks[0].value;
			this.loadAccounts(this.selectedBankId);
		}
	}

	async loadAccounts(bankId: string) {
		this.accounts = await this.apiService.getAccounts(bankId);
	}

	async loadRecentTransactions() {
		this.recentTransactions = await this.apiService.getRecentTransactions();
	}

	onBankChange(event: any) {
		this.loadAccounts(event.value);
	}

	navigateToAccounts(event: Event) {
		event.preventDefault();
		this.router.navigate(["/user/accounts"]);
	}

	navigateToTransactions(event: Event) {
		event.preventDefault();
		this.router.navigate(["/user/transactions"]);
	}

	getFormattedAmount(amount: number): string {
		return `$${Math.abs(amount).toFixed(2)}`;
	}
}
