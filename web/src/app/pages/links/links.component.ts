import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { ApiService } from "@services/api.service";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { PlaidTokenService } from "@services/plaid-token.service";
import { AccordionModule } from "primeng/accordion";
import { MessageService } from "primeng/api";
import { BadgeModule } from "primeng/badge";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { ToastModule } from "primeng/toast";
import { bankLogos } from "src/app/models/bank-logos-map";
import type { Bank } from "src/app/models/bank.model";
import type { Plaid } from "src/app/models/plaid.model";

declare let Plaid: Plaid;

@Component({
	selector: "app-links",
	standalone: true,
	imports: [
		CommonModule,
		AccordionModule,
		BadgeModule,
		ButtonModule,
		DialogModule,
		ToastModule,
	],
	templateUrl: "./links.component.html",
	styles: [],
	providers: [MessageService],
})
export class LinksComponent implements OnInit {
	connectedBanks: any[] = [];
	displayDialog = false;
	isSandbox = true;

	constructor(
		private apiService: ApiService,
		private plaidTokenService: PlaidTokenService,
		private messageService: MessageService,
	) {}

	ngOnInit() {
		this.refreshConnectedBanks();
	}

	getBankLogo(bankName: string): string {
		return bankLogos[bankName] || "assets/images/default-bank.png";
	}

	startLink(): void {
		this.displayDialog = true;
	}

	confirmModeSelection(isSandbox: boolean): void {
		this.displayDialog = false;
		this.isSandbox = isSandbox;
		console.log(this.isSandbox);

		this.plaidTokenService.generateLinkToken(this.isSandbox).subscribe({
			next: (data) => {
				console.log(data);
				const handler = Plaid.create({
					token: data.link_token,
					onSuccess: (publicToken, metadata) => {
						console.log(`Finished with Link! ${JSON.stringify(metadata)}`);
						this.plaidTokenService
							.exchangePublicToken(publicToken, this.isSandbox)
							.subscribe({
								next: () => {
									this.refreshConnectedBanks();
									this.logSuccess("Success", "Bank connected successfully");
								},
								error: (err) => {
									this.logError("Failed to exchange public token");
								},
							});
					},
					onExit: (err, metadata) => {
						console.log(
							`Exited early. Error: ${JSON.stringify(err)} Metadata: ${JSON.stringify(metadata)}`,
						);
						this.logWarn("Exited early.");
					},
					onEvent: (eventName, metadata) => {
						console.log(
							`Event ${eventName}, Metadata: ${JSON.stringify(metadata)}`,
						);
					},
				});
				handler.open();
			},
			error: (err) => {
				this.logError("Failed to generate link token");
			},
		});
	}

	refreshConnectedBanks(): void {
		this.apiService
			.getBanks()
			.then((banksList) => {
				return Promise.all(
					banksList.map((bank) => {
						return this.apiService.getAccounts(bank.id).then((accounts) => {
							return {
								...bank,
								accounts,
								accountCount: accounts.length,
							};
						});
					}),
				);
			})
			.then((connectedBanks) => {
				this.connectedBanks = connectedBanks;
			})
			.catch((error) => {
				this.logError("Failed to load connected banks");
			});
	}

	deactivateBank(event: Event, itemId: string): void {
		this.plaidTokenService.deactivateBank(itemId).subscribe({
			next: () => {
				event.preventDefault();
				event.stopPropagation();
				this.connectedBanks = this.connectedBanks.filter(
					(bank) => bank.id !== itemId,
				);
				this.logSuccess("Success", "Bank deactivated successfully");
			},
			error: (err) => {
				this.logError("Failed to deactivate bank");
			},
		});
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
