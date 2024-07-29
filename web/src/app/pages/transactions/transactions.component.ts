import { CommonModule } from "@angular/common";
import { Component, OnDestroy, type OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { TimelineModule } from "primeng/timeline";

import { TableModule } from "primeng/table";
import type { PlaidTransaction } from "src/app/models/transaction.model";
import { DistributionChartComponent } from "../../components/distribution-chart/distribution-chart.component";
import { MonthlySpendChartComponent } from "./components/monthly-spend-chart/monthly-spend-chart.component";
import { SpendingsChartComponent } from "../../components/spending-chart/spendings-chart.component";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { ApiService } from "@services/api.service";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { SignalService } from "@services/signal.service";
import { CategoryDisplayPipe } from "src/app/utils/category-display.pipe";
import { ProgressSpinnerModule } from "primeng/progressspinner";

import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { DropdownModule } from "primeng/dropdown";
import { AnnualSpendingsChartComponent } from "@components/annual-spendings-chart/annual-spendings-chart.component";
import { bankLogos } from "src/app/models/bank-logos-map";
import { DialogModule } from "primeng/dialog";
import { DialogService, type DynamicDialogRef } from "primeng/dynamicdialog";
import { ChatDialogComponent } from "./components/chat-dialog/chat-dialog.component";
import { EventBusService, EventSubscription } from "@services/eventbus.service";
import { EventType, TransactionEvent } from "@common/event";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { AddTransactionDialogComponent } from "./components/add-transaction-dialog/add-transaction-dialog.component";

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
		AnnualSpendingsChartComponent,
		CategoryDisplayPipe,
		InputTextModule,
		FloatLabelModule,
		DropdownModule,
		ProgressSpinnerModule,
		DialogModule,
		ToastModule,
	],
	providers: [DialogService, MessageService],
	templateUrl: "./transactions.component.html",
	styles: "",
})
export class TransactionsComponent implements OnInit {
	transactions: PlaidTransaction[] = [];
	filteredTransactions: PlaidTransaction[] = [];
	searchQuery = "";
	selectedCriteria = "";
	minAmount: number | null = null;
	maxAmount: number | null = null;
	searchCriteria = [
		{ label: "Merchant", value: "name" },
		{ label: "Bank", value: "bank_name" },
		{ label: "Account Name", value: "account_name" },
		{ label: "Amount", value: "amount" },
		{ label: "Date", value: "date" },
		{ label: "Category", value: "category" },
	];
	// test comment
	// categoryData: { [key: string]: number } = {};
	// monthlySpendData: { [key: string]: number } = {};
	yearToMonthsMap = new Map<number, { label: string; value: number }[]>();
	years: any[] = [];
	months: any[] = [];
	selectedYear: number = new Date().getFullYear();
	selectedMonth: number | null = null;
	dropdownYears: any[] = [];
	dropdownMonths: any[] = [];
	modes = [
		{ label: "Monthly", value: "monthly" },
		{ label: "Timeline", value: "timeline" },
		// { label: "Custom Range", value: "customRange" },
	];
	selectedMode = "monthly";
	isLoading = false;
	dialogRef: DynamicDialogRef | undefined;
	query: string | undefined;
	answer: string | undefined;
	eventsub: EventSubscription<{
		uid: string;
		timestamp: number;
	}>;
	eventsub2: EventSubscription<{
		uid: string;
		timestamp: number;
	}>;

	constructor(
		private apiService: ApiService,
		private signalService: SignalService,
		private dialogService: DialogService,
		private eventbus: EventBusService,
		private messageService: MessageService,
	) {
		this.eventsub = this.eventbus.observe(EventType.NEW_TRANSACTION);
		this.eventsub.subscribe(() => {
			this.init();
			this.logSuccess("Transaction Updated", "You have new transactions!");
		});

		this.eventsub2 = this.eventbus.observe(EventType.REMOVE_TRANSACTION);
		this.eventsub2.subscribe(() => {
			this.init();
			this.logSuccess("Transaction Removed", "Successful deletion!");
		});
	}

	ngOnInit() {
		this.init();
	}

	init = async () => {
		this.isLoading = true;
		this.filteredTransactions = [];
		try {
			await this.initTransactionRange();
			await this.fetchTransactionsForPastYear();
			await this.fetchTransactionsByDateRange();
		} finally {
			this.isLoading = false;
		}
	};

	updateSelectedTimeline() {
		this.months = this.months.map((month) => {
			const [year, monthNumber] = month.split("-");
			const label = `${year}-${monthNumber}`;
			return label;
		});
	}

	isSelected(label: string): boolean {
		const [year, month] = label.split("-");
		return (
			Number.parseInt(year) === this.selectedYear &&
			Number.parseInt(month) === this.selectedMonth
		);
	}

	getBankLogo(bankName: string): string {
		return bankLogos[bankName] || "assets/images/bank-logos/bank.png";
	}

	async initTransactionRange() {
		this.months = [];

		// Get first and last transactions to determine transaction display range.
		const first = await this.apiService.getFirstTransaction();
		const last = await this.apiService.getLastTransaction();
		const [firstYear, firstMonth] = first.date.split("-").map(Number);
		const [lastYear, lastMonth] = last.date.split("-").map(Number);

		this.buildYearToMonthsMap(firstYear, firstMonth, lastYear, lastMonth);
		this.dropdownYears = Array.from(this.yearToMonthsMap.keys());
		this.dropdownMonths = this.yearToMonthsMap.get(lastYear) || [];

		// Add in all months between first and last transaction.
		let yearCounter = firstYear;
		let monthCounter = firstMonth;
		for (;;) {
			this.months.push(
				`${yearCounter}-${monthCounter.toString().padStart(2, "0")}`,
			);
			monthCounter++;
			if (monthCounter > 12) {
				monthCounter = 1;
				yearCounter++;
			}
			if (
				yearCounter > lastYear ||
				(yearCounter === lastYear && monthCounter > lastMonth)
			) {
				break;
			}
		}

		// Set selected year and month to last transaction and update timeline selection.
		this.selectedMonth = lastMonth;
		this.selectedYear = lastYear;
		this.updateSelectedTimeline();
	}

	showAddTransactionDialog() {
		this.dialogService.open(AddTransactionDialogComponent, {
			header: "Add Transaction",
			baseZIndex: 10000,
			contentStyle: { overflow: "visible" },
		});
	}

	async deleteUserTransaction(transactionId: string) {
		try {
			await this.apiService.deleteUserTransaction(transactionId);
			this.init();
		} catch (error) {
			this.messageService.add({
				severity: "error",
				summary: "Error",
				detail: "Failed to delete the transaction",
			});
		}
	}

	getFormattedAmount(amount: number): string {
		return `$${Math.abs(amount).toFixed(2)}`;
	}

	buildYearToMonthsMap(
		firstYear: number,
		firstMonth: number,
		lastYear: number,
		lastMonth: number,
	) {
		const months = [
			{ label: "January", value: 1 },
			{ label: "February", value: 2 },
			{ label: "March", value: 3 },
			{ label: "April", value: 4 },
			{ label: "May", value: 5 },
			{ label: "June", value: 6 },
			{ label: "July", value: 7 },
			{ label: "August", value: 8 },
			{ label: "September", value: 9 },
			{ label: "October", value: 10 },
			{ label: "November", value: 11 },
			{ label: "December", value: 12 },
		];

		for (let year = firstYear; year <= lastYear; year++) {
			const startMonth = year === firstYear ? firstMonth - 1 : 0;
			const endMonth = year === lastYear ? lastMonth - 1 : 11;

			this.yearToMonthsMap.set(year, months.slice(startMonth, endMonth + 1));
		}
	}

	async fetchTransactionsForPastYear() {
		const selectedYear = this.selectedYear as number;
		const transactions =
			await this.apiService.getTransactionsByYear(selectedYear);

		// Process transactions to format the data for the line chart
		const monthlySpend = new Array(12).fill(0); // Initialize array for 12 months

		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth(); // 0-based index for current month

		for (const transaction of transactions) {
			const transactionDate = new Date(transaction.date);
			const month = transactionDate.getMonth(); // 0-based index for months
			if (selectedYear === currentYear && month > currentMonth) {
				continue; // Skip future months if the selected year is the current year
			}
			monthlySpend[month] += transaction.amount;
		}

		// Convert array to object with month numbers as keys
		const monthlySpendData = monthlySpend.reduce(
			(acc, value, index) => {
				if (selectedYear !== currentYear || index <= currentMonth) {
					acc[index + 1] = Number.parseFloat(value.toFixed(2)); // Round to 2 decimal places
				}
				return acc;
			},
			{} as { [key: number]: number },
		);

		this.signalService.updateMonthlySpendData(monthlySpendData);
	}

	showChatModal() {
		this.dialogRef = this.dialogService.open(ChatDialogComponent, {
			header: "Query Transactions",
			width: "40rem",
			height: "35rem",
			baseZIndex: 10000,
			contentStyle: { overflow: "visible" },
		});

		this.dialogRef.onClose.subscribe((data) => {
			if (data) {
				this.answer = data.response;
			}
		});
	}

	hideChatModal() {
		if (this.dialogRef) {
			this.dialogRef.close();
		}
	}

	filterTransactions() {
		const query = this.searchQuery.toLowerCase();
		const criteria = this.selectedCriteria;

		this.filteredTransactions = this.transactions.filter((transaction) => {
			switch (criteria) {
				case "name":
					return transaction.name.toLowerCase().includes(query);
				case "bank_name":
					return transaction.account.item.bank_name
						.toLowerCase()
						.includes(query);
				case "account_name":
					return transaction.account.name.toLowerCase().includes(query);
				case "date":
					return transaction.date.includes(query);
				case "category":
					return transaction.category.toLowerCase().includes(query);
				case "amount": {
					const amount = transaction.amount;
					const min =
						this.minAmount != null ? this.minAmount : Number.NEGATIVE_INFINITY;
					const max =
						this.maxAmount != null ? this.maxAmount : Number.POSITIVE_INFINITY;
					return amount >= min && amount <= max;
				}
				default:
					return true;
			}
		});
	}

	monthSelection(event: Event, label: string) {
		// On click handler for month selection.
		event.preventDefault();
		this.selectedYear = Number.parseInt(label.split("-")[0]);
		this.selectedMonth = Number.parseInt(label.split("-")[1]);
		this.updateSelectedTimeline();
		this.fetchTransactionsByDateRange();
	}

	async fetchTransactionsByDateRange() {
		this.isLoading = true;
		let startDate = "";
		let endDate = "";
		if (this.selectedMode === "monthly" || this.selectedMode === "timeline") {
			if (!(this.selectedYear && this.selectedMonth)) {
				this.isLoading = false;
				return;
			}
			startDate = `${this.selectedYear}-${this.selectedMonth
				.toString()
				.padStart(2, "0")}-01`;
			endDate = `${this.selectedYear}-${this.selectedMonth
				.toString()
				.padStart(2, "0")}-${new Date(
				this.selectedYear,
				this.selectedMonth,
				0,
			).getDate()}`;
		}
		if (!(startDate && endDate)) {
			this.isLoading = false;
			return;
		}

		this.transactions = await this.apiService.getTransactionsByDateRange(
			startDate,
			endDate,
		);
		this.filteredTransactions = this.transactions; // Initialize filtered transactions
		this.isLoading = false;
		this.updateCategoryData();
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

	// updateMonthlySpendData() {
	// 	const monthlySpendData = this.transactions.reduce(
	// 		(acc: { [key: string]: number }, transaction: PlaidTransaction) => {
	// 			const month = new Date(transaction.date).getMonth() + 1;
	// 			if (!acc[month]) {
	// 				acc[month] = 0;
	// 			}
	// 			acc[month] += transaction.amount;
	// 			return acc;
	// 		},
	// 		{},
	// 	);
	// 	this.signalService.updateMonthlySpendData(monthlySpendData);
	// }

	isVerified(transaction: PlaidTransaction): boolean {
		return transaction.authorized_date !== null;
	}

	getVerificationIcon(transaction: PlaidTransaction): string {
		return transaction.authorized_date !== null ? "pi pi-check" : "pi pi-clock";
	}

	ngOnDestroy(): void {
		this.eventsub.unsubscribe();
	}

	logSuccess(summary: string, detail: string) {
		this.messageService.add({
			severity: "success",
			summary,
			detail,
		});
	}

	logError(detail: string) {
		this.messageService.add({
			severity: "error",
			summary: "Error",
			detail: detail,
		});
	}

	logWarn(detail: string) {
		this.messageService.add({
			severity: "warn",
			summary: "Warning",
			detail: detail,
		});
	}
}
