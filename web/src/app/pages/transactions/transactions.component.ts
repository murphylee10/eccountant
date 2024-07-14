import { CommonModule } from "@angular/common";
import { Component, type OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PlaidTransactionsService } from "@services/plaid-transactions.service";
import { ButtonModule } from "primeng/button";
import { TimelineModule } from 'primeng/timeline';

import { TableModule } from "primeng/table";
import type { PlaidTransaction } from "src/app/models/transaction.model";
import { DistributionChartComponent } from "./components/distribution-chart/distribution-chart.component";
import { MonthlySpendChartComponent } from "./components/monthly-spend-chart/monthly-spend-chart.component";
import { SpendingsChartComponent } from "./components/spending-chart/spendings-chart.component";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { ApiService } from "@services/api.service";
import { PlaidTokenService } from "@services/plaid-token.service";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { SignalService } from "@services/signal.service";
import { CategoryDisplayPipe } from "src/app/utils/category-display.pipe";

@Component({
	selector: "app-transactions",
	standalone: true,
	imports: [
		ButtonModule,
		TableModule,
		CommonModule,
		TimelineModule,
		FormsModule,
		ReactiveFormsModule,
		DistributionChartComponent,
		MonthlySpendChartComponent,
		SpendingsChartComponent,
		CategoryDisplayPipe,
	],
	templateUrl: "./transactions.component.html",
	styles: "",
})
export class TransactionsComponent implements OnInit {
	transactions: PlaidTransaction[] = [];
	// categoryData: { [key: string]: number } = {};
	// monthlySpendData: { [key: string]: number } = {};
	years: any[] = [];
	months: any[] = [];
	selectedYear: number | null = null;
	selectedMonth: number | null = null;

	constructor(
		private apiService: ApiService,
		private signalService: SignalService,
	) {}

	async ngOnInit(): Promise<void> {
		await this.initTransactionRange();
		this.fetchTransactionsByDateRange();
	}

	async initTransactionRange() {
		this.months = [];

		const first = await this.apiService.getFirstTransaction();
		const last = await this.apiService.getLastTransaction();
		const [firstYear, firstMonth] = first.date.split("-").map(Number);
		const [lastYear, lastMonth] = last.date.split("-").map(Number);

		let yearCounter = firstYear;
		let monthCounter = firstMonth;
		for (;;) {
			this.months.push(`${yearCounter}-${monthCounter.toString().padStart(2, "0")}`);
			monthCounter++;
			if (monthCounter > 12) {
				monthCounter = 1;
				yearCounter++;
			}
			if (yearCounter > lastYear || (yearCounter === lastYear && monthCounter > lastMonth)) {
				break;
			}
		}
		this.selectedMonth = lastMonth;
		this.selectedYear = lastYear;
	}

	monthSelection(event: Event, label: string) {
		event.preventDefault();
		this.selectedYear = parseInt(label.split("-")[0]);
		this.selectedMonth = parseInt(label.split("-")[1]);
		this.fetchTransactionsByDateRange();
	}

	async fetchTransactionsByDateRange() {
		if (this.selectedYear && this.selectedMonth) {
			const startDate = `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, "0")}-01`;
			const endDate = `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, "0")}-${new Date(this.selectedYear, this.selectedMonth, 0).getDate()}`;

			this.transactions = await this.apiService.getTransactionsByDateRange(
				startDate,
				endDate,
			);
			this.updateCategoryData();
			this.updateMonthlySpendData();

			// this.plaidTransactionsService.getTransactionsByDateRange(startDate, endDate).subscribe((transactions) => {
			//   this.transactions = transactions;
			//   this.updateCategoryData();
			//   this.updateMonthlySpendData();
			// });
		}
	}

	updateCategoryData() {
		const categoryData = this.transactions.reduce(
			(acc: { [key: string]: number }, transaction: PlaidTransaction) => {
				if (transaction.amount > 0) {
					// Filter out negative amounts
					if (!acc[transaction.category]) {
						acc[transaction.category] = 0;
					}
					acc[transaction.category] = Number.parseFloat(
						(acc[transaction.category] + transaction.amount).toFixed(2),
					);
				}
				return acc;
			},
			{},
		);

		this.signalService.updateCategoryData(categoryData);
	}

	updateMonthlySpendData() {
		const monthlySpendData = this.transactions.reduce(
			(acc: { [key: string]: number }, transaction: PlaidTransaction) => {
				const month = new Date(transaction.date).getMonth() + 1;
				if (!acc[month]) {
					acc[month] = 0;
				}
				acc[month] += transaction.amount;
				return acc;
			},
			{},
		);
		this.signalService.updateMonthlySpendData(monthlySpendData);
	}

	isVerified(transaction: PlaidTransaction): boolean {
		return transaction.authorized_date !== null;
	}

	getVerificationIcon(transaction: PlaidTransaction): string {
		return transaction.authorized_date !== null ? "pi pi-check" : "pi pi-clock";
	}
}
