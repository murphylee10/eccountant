import { CommonModule } from "@angular/common";
import { Component, type OnInit } from "@angular/core";
// biome-ignore lint/style/useImportType: angular needs the whole module imported
import { Router } from "@angular/router";
// biome-ignore lint/style/useImportType: angular needs the whole module imported
import { AuthService } from "@auth0/auth0-angular";
import { ButtonModule } from "primeng/button";
import { MenubarModule } from "primeng/menubar";

@Component({
	selector: "app-landing",
	standalone: true,
	imports: [MenubarModule, ButtonModule, CommonModule],
	templateUrl: "./landing.component.html",
	styles: "",
})
export class LandingComponent implements OnInit {
	isAuthenticated = false;

	constructor(
		private auth: AuthService,
		private router: Router,
	) {}

	ngOnInit(): void {
		this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
			this.isAuthenticated = isAuthenticated;
		});
	}

	handleButtonClick(): void {
		if (this.isAuthenticated) {
			this.router.navigate(["/user/dashboard"]);
		} else {
			this.router.navigate(["/sign-in"]);
		}
	}

	logout(): void {
		this.auth.logout();
	}
}
