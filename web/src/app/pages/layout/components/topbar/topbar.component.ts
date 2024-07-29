import { CommonModule } from "@angular/common";
import { Component, ViewChild } from "@angular/core";
// biome-ignore lint/style/useImportType: angular needs the whole module imported
import { AuthService } from "@auth0/auth0-angular";
import type { MenuItem } from "primeng/api";
import { MenuModule } from "primeng/menu";
import { MenubarModule } from "primeng/menubar";
import { OverlayModule } from "primeng/overlay";
import { type OverlayPanel, OverlayPanelModule } from "primeng/overlaypanel";

interface CustomMenuItem extends MenuItem {
	path?: string;
}

@Component({
	selector: "layout-topbar",
	standalone: true,
	imports: [
		MenuModule,
		MenubarModule,
		OverlayModule,
		OverlayPanelModule,
		CommonModule,
	],
	templateUrl: "./topbar.component.html",
	styles: "",
})
export class TopbarComponent {
	@ViewChild("overlay") overlay!: OverlayPanel;
	items: MenuItem[] = [];
	sidebarItems: CustomMenuItem[] = [];

	constructor(public auth: AuthService) {}

	ngOnInit() {
		this.items = [
			{
				label: "Logout",
				icon: "pi pi-sign-out",
				command: () => {
					this.auth.logout({
						logoutParams: { returnTo: `${window.location.origin}/sign-in` },
					});
				},
			},
		];

		this.sidebarItems = [
			{ label: "Dashboard", icon: "pi pi-home", path: "/user/dashboard" },
			{ label: "Accounts", icon: "pi pi-user", path: "/user/accounts" },
			{ label: "Transactions", icon: "pi pi-list", path: "/user/transactions" },
			{
				label: "Subscriptions",
				icon: "pi pi-calendar",
				path: "/user/subscriptions",
			},
		];
	}
}
