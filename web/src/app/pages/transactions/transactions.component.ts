import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './transactions.component.html',
  styles: ``,
})
export class TransactionsComponent {}
