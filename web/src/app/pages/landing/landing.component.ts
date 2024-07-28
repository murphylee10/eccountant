import { CommonModule } from "@angular/common";
import { Component, type OnInit } from "@angular/core";
// biome-ignore lint/style/useImportType: angular needs the whole module imported
import { Router } from "@angular/router";
// biome-ignore lint/style/useImportType: angular needs the whole module imported
import { AuthService } from "@auth0/auth0-angular";
import { ButtonModule } from "primeng/button";
import { MenubarModule } from "primeng/menubar";
import { ChartModule } from "primeng/chart";

@Component({
	selector: "app-landing",
	standalone: true,
	imports: [MenubarModule, ButtonModule, CommonModule, ChartModule],
	templateUrl: "./landing.component.html",
	styles: [],
})
export class LandingComponent implements OnInit {
	isAuthenticated = false;
	data: any;
	options: any;

	constructor(
		private auth: AuthService,
		private router: Router,
	) {}

	ngOnInit(): void {
		this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
			this.isAuthenticated = isAuthenticated;
		});

		this.data = {
			labels: ["January", "February", "March", "April", "May", "June", "July"],
			datasets: [
				{
					label: "Time vs Money",
					data: [65, 59, 80, 81, 56, 55, 40],
					fill: false,
					borderColor: "#4bc0c0",
				},
			],
		};

		this.options = {
			scales: {
				x: {
					title: {
						display: true,
						text: "Time",
					},
				},
				y: {
					title: {
						display: true,
						text: "Money",
					},
				},
			},
		};
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
