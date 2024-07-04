import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlaidTransactionsService } from '@services/plaid-transactions.service';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { PlaidTransaction } from 'src/app/models/transaction.model';

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
  ],
  templateUrl: './transactions.component.html',
  styles: ``,
})
export class TransactionsComponent implements OnInit {
  transactions: PlaidTransaction[] = [];
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
        });
    }
  }

  isVerified(transaction: PlaidTransaction): boolean {
    return transaction.authorized_date !== null;
  }

  getVerificationIcon(transaction: PlaidTransaction): string {
    return transaction.authorized_date !== null ? 'pi pi-check' : 'pi pi-clock';
  }
}
