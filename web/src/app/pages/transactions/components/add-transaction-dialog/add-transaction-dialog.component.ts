import { Component } from "@angular/core";
// biome-ignore lint/style/useImportType: <explanation>
import { ApiService } from "@services/api.service";
import { MessageService } from "primeng/api";
// biome-ignore lint/style/useImportType: <explanation>
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { CalendarModule } from "primeng/calendar";
import { DropdownModule } from "primeng/dropdown";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { CommonModule } from "@angular/common";
import { CheckboxModule } from "primeng/checkbox";

@Component({
	selector: "app-add-transaction-dialog",
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		ButtonModule,
		DialogModule,
		InputTextModule,
		CalendarModule,
		DropdownModule,
		CheckboxModule,
	],
	providers: [MessageService],
	templateUrl: "./add-transaction-dialog.component.html",
	styles: "",
})
export class AddTransactionDialogComponent {
	display = true;
	transaction = {
		name: "",
		date: "",
		category: "",
		amount: 0,
		isIncoming: false,
	};

	constructor(
		private apiService: ApiService,
		private messageService: MessageService,
		public ref: DynamicDialogRef,
		public config: DynamicDialogConfig,
	) {}

	addTransaction() {
		if (
			!this.transaction.name ||
			!this.transaction.date ||
			!this.transaction.category ||
			this.transaction.amount === null
		) {
			this.messageService.add({
				severity: "error",
				summary: "Error",
				detail: "All fields are required",
			});
			return;
		}

		this.apiService.addTransaction(this.transaction).then(
			() => {
				this.messageService.add({
					severity: "success",
					summary: "Success",
					detail: "Transaction added successfully",
				});
				this.ref.close();
			},
			(error) => {
				this.messageService.add({
					severity: "error",
					summary: "Error",
					detail: "Failed to add transaction",
				});
			},
		);
	}
}
