// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { ApiService } from '@services/api.service';
import { Component, OnDestroy, inject, type OnInit } from '@angular/core';
import type { SelectItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { Router } from '@angular/router';
import type { PlaidTransaction } from 'src/app/models/transaction.model'; // Make sure to import the model
import { DistributionChartComponent } from '@components/distribution-chart/distribution-chart.component';
import { AnnualSpendingsChartComponent } from '@components/annual-spendings-chart/annual-spendings-chart.component';
import { SignalService } from '@services/signal.service';
import { EventBusService, EventSubscription } from '@services/eventbus.service';
import { EventType } from '@common/event';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DropdownModule,
    FormsModule,
    CommonModule,
    DistributionChartComponent,
    AnnualSpendingsChartComponent,
  ],
  templateUrl: './dashboard.component.html',
  styles: '',
})
export class DashboardComponent implements OnInit, OnDestroy {
  banks: SelectItem[] = [];
  selectedBankId = '';
  accounts: any[] = [];
  recentTransactions: PlaidTransaction[] = []; // Add a property for recent transactions
  currentYear: number = new Date().getFullYear();
  signalService = inject(SignalService);
  eventsub: EventSubscription<{
    uid: string;
    timestamp: number;
  }>;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private eventbus: EventBusService,
  ) {
    this.eventsub = this.eventbus.observe(EventType.NEW_TRANSACTION);
    this.eventsub.subscribe(() => this.init(true));
  }

  async ngOnInit() {
    await this.init(false);
  }

  init = async (webhook: boolean) => {
    if (webhook) console.log('Webhook fired');
    await this.loadBanks();
    await this.loadRecentTransactions();
    await this.loadCategoryData();
    await this.loadMonthlySpendData();
  };

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

  async loadCategoryData() {
    const { startDate, endDate } = this.getCurrentMonthDateRange();
    const transactions = await this.apiService.getTransactionsByDateRange(
      startDate,
      endDate,
    );

    const categoryData = transactions.reduce(
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

  async loadMonthlySpendData() {
    const selectedYear = this.currentYear;
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

    this.signalService.updateMonthlySpendData(monthlySpendData);
  }

  getCurrentMonthDateRange() {
    const currentDate = new Date();
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    return {
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
    };
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onBankChange(event: any) {
    this.loadAccounts(event.value);
  }

  navigateToAccounts(event: Event) {
    event.preventDefault();
    this.router.navigate(['/user/accounts']);
  }

  navigateToTransactions(event: Event) {
    event.preventDefault();
    this.router.navigate(['/user/transactions']);
  }

  getFormattedAmount(amount: number): string {
    return `$${Math.abs(amount).toFixed(2)}`;
  }

  ngOnDestroy(): void {
    this.eventsub.unsubscribe();
  }
}
