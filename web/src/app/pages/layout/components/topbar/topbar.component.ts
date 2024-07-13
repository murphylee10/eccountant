import { Component } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";
import type { MenuItem } from "primeng/api";
import { MenuModule } from "primeng/menu";
import { MenubarModule } from "primeng/menubar";

@Component({
	selector: "layout-topbar",
	standalone: true,
	imports: [MenuModule, MenubarModule],
	templateUrl: "./topbar.component.html",
	styles: "",
})
export class TopbarComponent {
	items: MenuItem[] | undefined;

	constructor(public auth: AuthService) {}

	ngOnInit() {
		this.items = [
			{
				label: "Preferences",
				icon: "pi pi-cog",
				command: () => {
					this.navigateToPreferences();
				},
			},
			{
				label: "Logout",
				icon: "pi pi-sign-out",
				command: () => {
					this.auth.logout({
						logoutParams: { returnTo: window.location.origin },
					});
				},
			},
		];
	}

	navigateToPreferences() {
		// Navigation logic
	}

	logout() {
		// Logout logic
	}
}
