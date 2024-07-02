import { Routes } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [{ path: '', component: TransactionsComponent }],
  },
];
