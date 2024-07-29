import { CommonModule } from "@angular/common";
import { Component, type OnInit } from "@angular/core";
// biome-ignore lint/style/useImportType: <explanation>
import { ApiService } from "@services/api.service";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import type { Subscription } from "src/app/models/subscription.model";
import { NotificationSettingsDialogComponent } from "./components/notification-settings-dialog/notification-settings-dialog.component";

@Component({
	selector: "app-subscriptions",
	standalone: true,
	imports: [
		CommonModule,
		TableModule,
		ButtonModule,
		ProgressSpinnerModule,
		DialogModule,
		DropdownModule,
		ToastModule,
	],
	templateUrl: "./subscriptions.component.html",
	providers: [DialogService, MessageService],
	styles: "",
})
export class SubscriptionsComponent implements OnInit {
	acceptedSubscriptions: Subscription[] = [];
	notAcceptedSubscriptions: Subscription[] = [];
	isLoading = true;
	dialogRef: DynamicDialogRef | undefined;

	constructor(
		private apiService: ApiService,
		private dialogService: DialogService,
		private messageService: MessageService,
	) {}

	ngOnInit() {
		this.loadSubscriptions();
	}

	async loadSubscriptions() {
		try {
			this.isLoading = true;
			const result = await this.apiService.getSubscriptions();
			this.acceptedSubscriptions = result.accepted;
			this.notAcceptedSubscriptions = result.notAccepted;
		} catch (error) {
			console.error("Error fetching subscriptions:", error);
			this.logError("Error fetching subscriptions");
		} finally {
			this.isLoading = false;
		}
	}

	async acceptSubscription(subscription: Subscription) {
		try {
			await this.apiService.acceptSubscription(subscription.id);
			this.logSuccess(
				"Subscription Accepted",
				"The subscription has been accepted.",
			);
			this.loadSubscriptions();
		} catch (error) {
			console.error("Error accepting subscription:", error);
			this.logError("Error accepting subscription");
		}
	}

	async deleteSubscription(subscriptionId: string) {
		try {
			await this.apiService.removeSubscription(subscriptionId);
			this.logSuccess(
				"Subscription Removed",
				"The subscription has been removed.",
			);
			this.loadSubscriptions();
		} catch (error) {
			console.error("Error deleting subscription:", error);
			this.logError("Error deleting subscription");
		}
	}

	showNotificationSettings(subscription: Subscription) {
		this.dialogRef = this.dialogService.open(
			NotificationSettingsDialogComponent,
			{
				header: "Notification Settings",
				width: "35rem",
				height: "35rem",
				data: subscription,
			},
		);

		this.dialogRef.onClose.subscribe(async (result) => {
			if (result) {
				try {
					if (subscription.frequency === "MONTHLY") {
						await this.apiService.changeSubscriptionDay(
							subscription.id,
							result.day,
						);
					} else if (subscription.frequency === "ANNUALLY") {
						await this.apiService.changeSubscriptionMonth(
							subscription.id,
							result.month,
						);
					}
					this.logSuccess(
						"Notification Settings Updated",
						"The notification settings have been updated.",
					);
					this.loadSubscriptions();
				} catch (error) {
					console.error("Error updating notification settings:", error);
					this.logError("Error updating notification settings");
				}
			}
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
}
