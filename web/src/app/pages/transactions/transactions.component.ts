import { CommonModule } from '@angular/common';
import { Component, type OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlaidTransactionsService } from '@services/plaid-transactions.service';
import { ButtonModule } from 'primeng/button';
import { TimelineModule } from 'primeng/timeline';

import { TableModule } from 'primeng/table';
import type { PlaidTransaction } from 'src/app/models/transaction.model';
import { DistributionChartComponent } from './components/distribution-chart/distribution-chart.component';
import { MonthlySpendChartComponent } from './components/monthly-spend-chart/monthly-spend-chart.component';
import { SpendingsChartComponent } from './components/spending-chart/spendings-chart.component';
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { ApiService } from '@services/api.service';
import { PlaidTokenService } from '@services/plaid-token.service';
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { SignalService } from "@services/signal.service";
import { CategoryDisplayPipe } from "src/app/utils/category-display.pipe";
import ollama from 'ollama'

@Component({
  selector: 'app-transactions',
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
  templateUrl: './transactions.component.html',
  styles: '',
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

  updateSelectedTimeline() {
    // Adds marker to selected year-month and removes marker from others.
    const MARKER = ' (Selected)';
    this.months = this.months.map((month) => {
      const [year, monthNumber] = month.split('-');
      const label = `${year}-${monthNumber}`;
      if (
        parseInt(year) === this.selectedYear &&
        parseInt(monthNumber) === this.selectedMonth
      ) {
        return `${label}${MARKER}`;
      } else {
        return label.replace(MARKER, '');
      }
    });
  }

  async initTransactionRange() {
    this.months = [];

    // Get first and last transactions to determine transaction display range.
    const first = await this.apiService.getFirstTransaction();
    const last = await this.apiService.getLastTransaction();
    const [firstYear, firstMonth] = first.date.split('-').map(Number);
    const [lastYear, lastMonth] = last.date.split('-').map(Number);

    // Add in all months between first and last transaction.
    let yearCounter = firstYear;
    let monthCounter = firstMonth;
    for (;;) {
      this.months.push(
        `${yearCounter}-${monthCounter.toString().padStart(2, '0')}`,
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


	async testOllama() {
    const question = "How much did I spend in July?";
    // const question = "How much did I spend on food and drink in June?";
    // const LLM_MODEL = 'llama3:8b';
    const LLM_MODEL = 'qwen:110b';
    // const LLM_MODEL = 'qwen';

		const response = await ollama.chat({
			model: LLM_MODEL,
			messages: [{ role: 'user', content: `
model Transaction {
  category: is type String and is one of 'Income', 'Transfer In', 'Transfer Out', 'Loan Payments', 'Bank Fees', 'Entertainment', 'Food and Drink', 'General Merchandise', 'Home Improvement', 'Medical', 'Personal Care', 'General Services', 'Government and Non-Profit', 'Transportation', 'Travel', 'Rent and Utilities'
  date: is type String in the format 'YYYY-MM-DD'.
  name: is type String is the name of the transaction.
  amount: is type Float.
}

Task: convert into an SQL query based on the relation(s) defined above.
"${question}"

Requirements:
- Respond with only the SQL query.
- Prioritize making the query simple and efficient.
- Do not include any formatting.
- All relations names in double quotes.
- Do not use any non-postgreSQL functions.
- The current date at the time of writing is 2024-07-15. Therefore, if the question does not specify a year, use 2024 and if the question does not specify a month, use July, otherwise use the year or month that is specified.
- The date is type string, so compare dates using string comparison i.e., >=, < ,etc. otherwise you need to convert to a date object before comparing.
				 ` }],
		  })
		  const content = response.message.content;
		  console.log(content)
		  var query = content;
		  if (content.includes('```')) {
			const lines = content.split('\n');
			const idx_begin = lines.findIndex(line => line.includes('```'));
			const idx_end = lines.findIndex(line => line.includes('```'), idx_begin + 1);
			query = lines.slice(idx_begin + 1, idx_end).join('\n');
		  }
		  console.log(query)


    // const query = `SELECT SUM(t.amount) AS total_spent FROM "Transaction" t INNER JOIN "Account" acc ON t.account_id = acc.id WHERE t.category = 'groceries' AND strftime('%m', t.date) = '06';`
		  // const query = "SELECT * FROM Transaction;"
		// console.log(query)

    // SELECT SUM(t.amount) AS total_spent
    // FROM "Transaction" t
    // JOIN "Account" acc ON t."account_id" = acc.id
    // WHERE t.category = 'groceries'
    // AND strftime('%m', t.date) = '06'
    

			// const query = `SELECT SUM(amount) FROM "Transaction" WHERE category = 'Food and Drink' AND date >= '2024-06-01' AND date <= '2024-06-31';`
      // const query = `SELECT SUM(amount) FROM "Transaction" WHERE category = 'Food and Drink' AND date >= '2024-06-01' AND date <= '2024-06-31';`;

		  const res = await this.apiService.ask(query);
      const val = res[0];
      const joined = JSON.stringify(res);
			console.log(joined)

		const postres = await ollama.chat({
			model: LLM_MODEL,
			messages: [{ role: 'user', content: `
The user asked the question below:
"${question}"

You previously generated an SQL query that resulted in the following result:
${joined}

Write a concise human-readable response to the user's question.
				 ` }],
		  })
		  const cc = postres.message.content;
		  console.log(cc)

	}

	monthSelection(event: Event, label: string) {
		// On click handler for month selection.
		event.preventDefault();
		// this.selectedYear = parseInt(label.split("-")[0]);
		// this.selectedMonth = parseInt(label.split("-")[1]);
		// this.updateSelectedTimeline();
		// this.fetchTransactionsByDateRange();
		this.testOllama();

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
    return transaction.authorized_date !== null ? 'pi pi-check' : 'pi pi-clock';
  }
}
