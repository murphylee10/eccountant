import { CommonModule } from "@angular/common";
import { Component, type OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PlaidTransactionsService } from "@services/plaid-transactions.service";
import { ButtonModule } from "primeng/button";
import { TimelineModule } from "primeng/timeline";

import { TableModule } from "primeng/table";
import type { PlaidTransaction } from "src/app/models/transaction.model";
import { DistributionChartComponent } from "../../components/distribution-chart/distribution-chart.component";
import { MonthlySpendChartComponent } from "./components/monthly-spend-chart/monthly-spend-chart.component";
import { SpendingsChartComponent } from "../../components/spending-chart/spendings-chart.component";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { ApiService } from "@services/api.service";
import { PlaidTokenService } from "@services/plaid-token.service";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { SignalService } from "@services/signal.service";
import { CategoryDisplayPipe } from "src/app/utils/category-display.pipe";

import ollama, { ChatResponse } from "ollama";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { DropdownModule } from "primeng/dropdown";
import { AnnualSpendingsChartComponent } from "@components/annual-spendings-chart/annual-spendings-chart.component";

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
	],
	templateUrl: "./transactions.component.html",
	styles: "",
})
export class TransactionsComponent implements OnInit {
	transactions: PlaidTransaction[] = [];
	// test comment
	// categoryData: { [key: string]: number } = {};
	// monthlySpendData: { [key: string]: number } = {};
	yearToMonthsMap = new Map<number, { label: string; value: number }[]>();
	years: any[] = [];
	months: any[] = [];
	selectedYear: number = new Date().getFullYear();
	selectedMonth: number | null = null;
	query: string | undefined;
	answer: string | undefined;
	dropdownYears: any[] = [];
	dropdownMonths: any[] = [];
	modes = [
		{ label: "Monthly", value: "monthly" },
		{ label: "Timeline", value: "timeline" },
		{ label: "Custom Range", value: "customRange" },
	];
	selectedMode = "monthly";

	constructor(
		private apiService: ApiService,
		private signalService: SignalService,
	) {}

	async ngOnInit(): Promise<void> {
		await this.initTransactionRange();
		await this.fetchTransactionsForPastYear();
		this.fetchTransactionsByDateRange();
	}

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
					acc[index + 1] = value; // Month numbers as keys (1-based index)
				}
				return acc;
			},
			{} as { [key: number]: number },
		);

		console.log("Monthly spend data:", monthlySpendData);

		// Update signal service with the monthly spend data
		this.signalService.updateMonthlySpendData(monthlySpendData);
	}

	async generateQuery(question: string, LLM_MODEL: string) {
		return await ollama.chat({
			model: LLM_MODEL,
			messages: [
				{
					role: "user",
					content: `
model Transaction {
  category: is type String and is one of 'Income', 'Transfer In', 'Transfer Out', 'Loan Payments', 'Bank Fees', 'Entertainment', 'Food and Drink', 'General Merchandise', 'Home Improvement', 'Medical', 'Personal Care', 'General Services', 'Government and Non-Profit', 'Transportation', 'Travel', 'Rent and Utilities'
  date: is type String in the format 'YYYY-MM-DD'.
  name: is type String is the name of the transaction.
  amount: is type Float.
}

Question: "${question}".
Task: understand the question is asking and write a postgreSQL query to retrieve the information.

Requirements:
- Respond with only the postgreSQL query.
- Do not include formatting.
- The current year is 2024.
- The current month is July.
- The date column is type String. Any date operation must be done taking this into account.
				 `,
				},
			],
		});
		// - The current date at the time of writing is 2024-07-15. Therefore, if the question does not specify a year, use 2024 and if the question does not specify a month, use July, otherwise use the year or month that is specified.
		// - Do not use any non-postgreSQL functions.
		// - The query should be simple and efficient.
		// - All relations names in double quotes but do not escape the quotes.
		// - The date is type string, so compare dates using string comparison i.e., >=, < ,etc. otherwise you need to convert to a date object before comparing.
		// - You must compare dates using string comparison.
	}

	cleanResponse(response: ChatResponse) {
		const content = response.message.content;
		let query = content;
		if (content.includes("```")) {
			const lines = content.split("\n");
			const idx_begin = lines.findIndex((line) => line.includes("```"));
			const idx_end = lines.findIndex(
				(line) => line.includes("```"),
				idx_begin + 1,
			);
			query = lines.slice(idx_begin + 1, idx_end).join("\n");
		}

		const TABLES = new Set(["User", "Item", "Account", "Transaction"]);
		const queryParts = query.trim().split(/\s+/);
		for (let i = 1; i < queryParts.length; i++) {
			if (queryParts[i - 1].toUpperCase() === "FROM") {
				const clean = queryParts[i].replace(`"`, "");
				if (TABLES.has(clean)) {
					queryParts[i] = `"${clean}"`;
				}
			}
		}
		const formattedQuery = queryParts.join(" ");
		return formattedQuery;
	}

	async formulateResponse(LLM_MODEL: string, question: string, res: string) {
		const postres = await ollama.chat({
			model: LLM_MODEL,
			messages: [
				{
					role: "user",
					content: `
  Question: "${question}".
  Answer: "${res}".
  Task: say the answer in one sentence.
           `,
				},
			],
		});
		const cc = postres.message.content;
		return cc;
	}

	async queryTransactions() {
		const question = this.query;
		if (!question) {
			return;
		}
		// const question = "How much did I spend this month?";
		// const question = "How much did I spend last month?";
		// const question = "How much did I spend on groceries in June?";
		// const question = "How much did I spend between april 24th and june 29?";
		// const question = "Which month did I spend the most and how much?";
		// const question = "How much have I spent on KFC?";
		// const question = "How much have I spent on KFC all time?";
		// const question = "How much did I spend in august 2022?";
		// const question = "How much did I spend in July?";
		// const question = "How much did I spend on food and drink in June?";
		// const question = "How much did I spend on food in June?";

		const LLM_MODEL = "codestral:22b";
		// const LLM_MODEL = 'qwen2:72b';
		// const LLM_MODEL = 'mistral:7b-instruct'
		// const LLM_MODEL = 'codellama:13b-instruct'
		// const LLM_MODEL = 'phi3:14b-instruct'
		// const LLM_MODEL = 'phi3:14b-instruct'
		// const LLM_MODEL = 'deepseek-coder-v2:16b';
		// const LLM_MODEL = 'qwen';
		// const LLM_MODEL = 'llama3:8b';

		console.log(question);
		const response = await this.generateQuery(question, LLM_MODEL);
		console.log("response:", response.message.content);
		const formattedQuery = this.cleanResponse(response);
		console.log("formatted:", formattedQuery);

		const res = JSON.stringify(await this.apiService.ask(formattedQuery));
		console.log(res);

		const cc = await this.formulateResponse(LLM_MODEL, question, res);
		console.log(cc);
		this.answer = cc;
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
		let startDate = "";
		let endDate = "";
		if (this.selectedMode === "monthly" || this.selectedMode === "timeline") {
			if (!(this.selectedYear && this.selectedMonth)) {
				return;
			}
			startDate = `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, "0")}-01`;
			endDate = `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, "0")}-${new Date(this.selectedYear, this.selectedMonth, 0).getDate()}`;
		}
		if (!(startDate && endDate)) {
			return;
		}

		this.transactions = await this.apiService.getTransactionsByDateRange(
			startDate,
			endDate,
		);
		// this.updateSelectedTimeline();
		console.log("Transactions:", this.transactions);
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
}
