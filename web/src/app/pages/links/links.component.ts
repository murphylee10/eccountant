import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PlaidService } from '@services/plaid.service';
import { Bank } from 'src/app/models/bank.model';
import { Plaid } from 'src/app/models/plaid.model';

declare var Plaid: Plaid;

@Component({
  selector: 'app-links',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './links.component.html',
  styles: ``,
})
export class LinksComponent {
  banksMessage: string | undefined;
  connectedBanks: Bank[] = [];

  constructor(private plaidService: PlaidService) {}

  ngOnInit(): void {
    this.refreshConnectedBanks();
  }

  startLink(): void {
    this.plaidService.generateLinkToken().subscribe((data) => {
      const handler = Plaid.create({
        token: data.link_token,
        onSuccess: (publicToken, metadata) => {
          console.log(`Finished with Link! ${JSON.stringify(metadata)}`);
          this.plaidService.exchangePublicToken(publicToken).subscribe(() => {
            this.refreshConnectedBanks();
          });
        },
        onExit: (err, metadata) => {
          console.log(
            `Exited early. Error: ${JSON.stringify(err)} Metadata: ${JSON.stringify(metadata)}`,
          );
        },
        onEvent: (eventName, metadata) => {
          console.log(
            `Event ${eventName}, Metadata: ${JSON.stringify(metadata)}`,
          );
        },
      });
      handler.open();
    });
  }

  refreshConnectedBanks(): void {
    this.plaidService.getConnectedBanks().subscribe((data) => {
      if (data == null || data.length === 0) {
        this.banksMessage = "You aren't connected to any banks yet.";
      } else if (data.length === 1) {
        this.banksMessage = `You're connected to ${data[0].bank_name ?? 'unknown'}`;
      } else {
        this.banksMessage =
          `You're connected to ` +
          data
            .map(
              (e, idx) =>
                (idx == data.length - 1 && data.length > 1 ? 'and ' : '') +
                (e.bank_name ?? '(Unknown)'),
            )
            .join(data.length !== 2 ? ', ' : ' ');
      }
      this.connectedBanks = data;
    });
  }

  deactivateBank(itemId: string): void {
    this.plaidService.deactivateBank(itemId).subscribe(() => {
      this.refreshConnectedBanks();
    });
  }
}
