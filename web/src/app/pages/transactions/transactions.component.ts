import { CommonModule } from '@angular/common';
import { Component, type OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlaidTransactionsService } from '@services/plaid-transactions.service';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import type { PlaidTransaction } from 'src/app/models/transaction.model';
import { DistributionChartComponent } from './components/distribution-chart/distribution-chart.component';
import { MonthlySpendChartComponent } from './components/monthly-spend-chart/monthly-spend-chart.component';
import { SpendingsChartComponent } from './components/spending-chart/spendings-chart.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    ButtonModule,
    TableModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    DistributionChartComponent,
    MonthlySpendChartComponent,
    SpendingsChartComponent,
  ],
  templateUrl: './transactions.component.html',
  styles: '',
})
export class TransactionsComponent implements OnInit {
  transactions: PlaidTransaction[] = [];
  categoryData: { [key: string]: number } = {};
  monthlySpendData: { [key: string]: number } = {};
  years: any[] = [];
  months: any[] = [];
  selectedYear: number | null = null;
  selectedMonth: number | null = null;

  constructor(private plaidTransactionsService: PlaidTransactionsService) {}

  ngOnInit(): void {
    this.initYearsAndMonths();
    this.fetchTransactionsByDateRange();
  }

  initYearsAndMonths() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Initialize years from 2020 to the current year
    for (let year = 2020; year <= currentYear; year++) {
      this.years.push({ label: year.toString(), value: year });
    }

    // Initialize months
    this.months = [
      { label: 'January', value: 1 },
      { label: 'February', value: 2 },
      { label: 'March', value: 3 },
      { label: 'April', value: 4 },
      { label: 'May', value: 5 },
      { label: 'June', value: 6 },
      { label: 'July', value: 7 },
      { label: 'August', value: 8 },
      { label: 'September', value: 9 },
      { label: 'October', value: 10 },
      { label: 'November', value: 11 },
      { label: 'December', value: 12 },
    ];

    this.selectedYear = currentYear;
    this.selectedMonth = currentMonth;
  }

  fetchTransactionsByDateRange() {
    if (this.selectedYear && this.selectedMonth) {
      const startDate = `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}-01`;
      const endDate = `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}-${new Date(this.selectedYear, this.selectedMonth, 0).getDate()}`;

      this.plaidTransactionsService
        .getTransactionsByDateRange(startDate, endDate)
        .subscribe((data: PlaidTransaction[]) => {
          console.log(data);
          this.transactions = data;
          this.updateCategoryData();
          this.updateMonthlySpendData();
        });
    }
  }

  updateCategoryData() {
    this.categoryData = this.transactions.reduce(
      (acc: { [key: string]: number }, transaction: PlaidTransaction) => {
        if (transaction.amount > 0) {
          // Filter out negative amounts
          if (!acc[transaction.category]) {
            acc[transaction.category] = 0;
          }
          acc[transaction.category] += transaction.amount;
        }
        return acc;
      },
      {},
    );
  }

  updateMonthlySpendData() {
    this.monthlySpendData = this.transactions.reduce(
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
    console.log(this.monthlySpendData);
  }

  isVerified(transaction: PlaidTransaction): boolean {
    return transaction.authorized_date !== null;
  }

  getVerificationIcon(transaction: PlaidTransaction): string {
    return transaction.authorized_date !== null ? 'pi pi-check' : 'pi pi-clock';
  }
}
