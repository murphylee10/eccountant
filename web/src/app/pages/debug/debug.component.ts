import { Component } from "@angular/core";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { ApiService } from "@services/api.service";
import { ButtonModule } from "primeng/button";

@Component({
	selector: "app-debug",
	standalone: true,
	imports: [ButtonModule],
	templateUrl: "./debug.component.html",
	styles: "",
})
export class DebugComponent {
	constructor(private api: ApiService) {}

	fireWebhook() {
		this.api.fireWebhook();
	}
}
