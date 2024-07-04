import { Component } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { PanelModule } from "primeng/panel";

@Component({
	selector: "app-root",
	standalone: true,
	imports: [RouterOutlet, ButtonModule, PanelModule, RouterModule],
	templateUrl: "./app.component.html",
})
export class AppComponent {
	title = "web";
}
