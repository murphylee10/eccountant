// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { ApiService } from "@services/api.service";
import { Component, type OnInit } from "@angular/core";
import type { SelectItem } from "primeng/api";
import { DropdownModule } from "primeng/dropdown";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";

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

	constructor(
		private apiService: ApiService,
		private router: Router,
	) {}

	async ngOnInit() {
		await this.loadBanks();
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

	onBankChange(event: any) {
		// console.log("switched to bank", event.value);
		this.loadAccounts(event.value);
	}

	navigateToAccounts(event: Event) {
		event.preventDefault();
		this.router.navigate(["/user/accounts"]);
	}
}
