import { CommonModule } from "@angular/common";
import { Component, type OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PlaidTransactionsService } from "@services/plaid-transactions.service";
import { ButtonModule } from "primeng/button";
// import { DropdownModule } from "primeng/dropdown";
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
		// DropdownModule,
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

	// ngOnInit(): void {
	// 	// this.initTransactionRange();
	// 	this.initYearsAndMonths();
	// 	this.fetchTransactionsByDateRange();
	// }

	async ngOnInit(): Promise<void> {
		await this.initTransactionRange();
		// this.initYearsAndMonths();
		this.fetchTransactionsByDateRange();
	}

	async initTransactionRange() {
		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth() + 1;


		const endDate = `${currentYear}-${currentMonth.toString().padStart(2, "0")}-${new Date(currentYear, currentMonth, 0).getDate()}`;
		const transactions = await this.apiService.getTransactionsByDateRange(
			'1924-01-01',
			endDate,
		)
		this.months = [];


		const first = transactions[transactions.length-1].date;
		const last = transactions[0].date;
		const firstYear = parseInt(first.split("-")[0])
		const firstMonth = parseInt(first.split("-")[1])
		const lastYear = parseInt(last.split("-")[0])
		const lastMonth = parseInt(last.split("-")[1])

		let yearCounter = firstYear;
		let monthCounter = firstMonth;
		for (;;) {
			this.months.push(`${yearCounter}-${monthCounter.toString().padStart(2, "0")}`);
			monthCounter++;
			if (monthCounter > 12) {
				monthCounter = 1;
				yearCounter++;
			}
			if (yearCounter == lastYear && monthCounter == lastMonth) {
				break;
			}
		}
	}

	monthSelection(event: any, label:any) {
		event.preventDefault();
		console.log(label)
	}

	// initYearsAndMonths() {
	// 	const currentYear = new Date().getFullYear();
	// 	const currentMonth = new Date().getMonth() + 1;

	// 	// Initialize years from 2020 to the current year
	// 	for (let year = 2020; year <= currentYear; year++) {
	// 		this.years.push({ label: year.toString(), value: year });
	// 	}

	// 	// Initialize months
	// 	this.months = [
	// 		{ label: "January", value: 1 },
	// 		{ label: "February", value: 2 },
	// 		{ label: "March", value: 3 },
	// 		{ label: "April", value: 4 },
	// 		{ label: "May", value: 5 },
	// 		{ label: "June", value: 6 },
	// 		{ label: "July", value: 7 },
	// 		{ label: "August", value: 8 },
	// 		{ label: "September", value: 9 },
	// 		{ label: "October", value: 10 },
	// 		{ label: "November", value: 11 },
	// 		{ label: "December", value: 12 },
	// 	];

	// 	this.selectedYear = currentYear;
	// 	this.selectedMonth = currentMonth;
	// }

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
