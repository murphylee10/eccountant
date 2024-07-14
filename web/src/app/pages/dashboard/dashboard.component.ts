import { Component } from "@angular/core";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { ApiService } from "@services/api.service";

@Component({
	selector: "app-dashboard",
	standalone: true,
	imports: [],
	templateUrl: "./dashboard.component.html",
	styles: "",
})
export class DashboardComponent {
	constructor(private apiService: ApiService) {}

	testWebhook() {
		this.apiService.fireWebhook().then((res) => {
			console.log("fired");
		});
	}
}
