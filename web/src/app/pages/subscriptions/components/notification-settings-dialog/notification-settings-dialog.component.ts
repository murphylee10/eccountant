import { Component } from "@angular/core";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { CommonModule } from "@angular/common";
import { DropdownModule } from "primeng/dropdown";
import { ButtonModule } from "primeng/button";
import { FormsModule } from "@angular/forms";

@Component({
	selector: "app-notification-settings-dialog",
	standalone: true,
	imports: [CommonModule, DropdownModule, ButtonModule, FormsModule],
	templateUrl: "./notification-settings-dialog.component.html",
	styles: "",
})
export class NotificationSettingsDialogComponent {
	frequency: string;
	days: number[] = Array.from({ length: 28 }, (_, i) => i + 1);
	months: { label: string; value: number }[] = [
		{ label: "January", value: 1 },
		{ label: "February", value: 2 },
		{ label: "March", value: 3 },
		{ label: "April", value: 4 },
		{ label: "May", value: 5 },
		{ label: "June", value: 6 },
		{ label: "July", value: 7 },
		{ label: "August", value: 8 },
		{ label: "September", value: 9 },
		{ label: "October", value: 10 },
		{ label: "November", value: 11 },
		{ label: "December", value: 12 },
	];
	selectedDay: number | null = null;
	selectedMonth: number | null = null;

	constructor(
		public ref: DynamicDialogRef,
		public config: DynamicDialogConfig,
	) {
		this.frequency = this.config.data.frequency;
	}

	save() {
		if (this.frequency === "MONTHLY" && this.selectedDay !== null) {
			this.ref.close({ day: this.selectedDay });
		} else if (this.frequency === "ANNUALLY" && this.selectedMonth !== null) {
			this.ref.close({ month: this.selectedMonth });
		} else {
			this.ref.close(null);
		}
	}
}
