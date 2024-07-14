import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { ApiService } from "@services/api.service";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { PlaidTokenService } from "@services/plaid-token.service";
import { AccordionModule } from "primeng/accordion";
import { BadgeModule } from "primeng/badge";
import { ButtonModule } from "primeng/button";
import { bankLogos } from "src/app/models/bank-logos-map";
import type { Bank } from "src/app/models/bank.model";
import type { Plaid } from "src/app/models/plaid.model";

declare let Plaid: Plaid;

@Component({
	selector: "app-links",
	standalone: true,
	imports: [CommonModule, AccordionModule, BadgeModule, ButtonModule],
	templateUrl: "./links.component.html",
	styles: "",
})
export class LinksComponent {
	banksMessage: string | undefined;
	// connectedBanks: Bank[] = [];
	connectedBanks: any[] = [];

	constructor(
		private apiService: ApiService,
		private plaidTokenService: PlaidTokenService,
	) {}

	async ngOnInit() {
		const banksList = await this.apiService.getBanks();
		this.connectedBanks = await Promise.all(
			banksList.map(async (bank) => {
				const accounts = await this.apiService.getAccounts(bank.id);
				return {
					...bank,
					accounts,
					accountCount: accounts.length,
				};
			}),
		);
	}

	getBankLogo(bankName: string): string {
		return bankLogos[bankName] || "assets/images/default-bank.png";
	}

	startLink(): void {
		this.plaidTokenService.generateLinkToken().subscribe((data) => {
			const handler = Plaid.create({
				token: data.link_token,
				onSuccess: (publicToken, metadata) => {
					console.log(`Finished with Link! ${JSON.stringify(metadata)}`);
					this.plaidTokenService
						.exchangePublicToken(publicToken)
						.subscribe(() => {
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
		this.plaidTokenService.getConnectedBanks().subscribe((data) => {
			console.log(data);
			if (data == null || data.length === 0) {
				this.banksMessage = "You aren't connected to any banks yet.";
			} else if (data.length === 1) {
				this.banksMessage = `You're connected to ${data[0].bank_name ?? "unknown"}`;
			} else {
				this.banksMessage = `You're connected to ${data
					.map(
						(e, idx) =>
							(idx === data.length - 1 && data.length > 1 ? "and " : "") +
							(e.bank_name ?? "(Unknown)"),
					)
					.join(data.length !== 2 ? ", " : " ")}`;
			}
			this.connectedBanks = data;
		});
	}

	deactivateBank(event: Event, itemId: string): void {
		this.plaidTokenService.deactivateBank(itemId).subscribe(() => {
			event.preventDefault();
			event.stopPropagation();
			this.connectedBanks = this.connectedBanks.filter(
				(bank) => bank.id !== itemId,
			);
		});
	}
}
