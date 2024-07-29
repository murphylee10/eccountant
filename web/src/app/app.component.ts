import { Component } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { PanelModule } from "primeng/panel";
import { EventBusService } from "@services/eventbus.service";
import { AuthService } from "@services/auth.service";

@Component({
	selector: "app-root",
	standalone: true,
	imports: [RouterOutlet, ButtonModule, PanelModule, RouterModule],
	templateUrl: "./app.component.html",
})
export class AppComponent {
	title = "web";

	constructor(
		private eventbus: EventBusService,
		private authService: AuthService,
	) {}
}
