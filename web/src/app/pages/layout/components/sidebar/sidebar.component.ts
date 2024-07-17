import { Component, type OnInit } from "@angular/core";
import { MenuModule } from "primeng/menu";
import { AvatarModule } from "primeng/avatar";
import { RippleModule } from "primeng/ripple";
import { CommonModule } from "@angular/common";
import type { MenuItem } from "primeng/api";

@Component({
	selector: "layout-sidebar",
	standalone: true,
	imports: [CommonModule, MenuModule, AvatarModule, RippleModule],
	templateUrl: "./sidebar.component.html",
	styles: "",
})
export class SidebarComponent implements OnInit {
	items: MenuItem[] = [];

	ngOnInit() {
		this.items = [
			{
				label: "My Analytics",
				items: [
					{ label: "Dashboard", icon: "pi pi-home", path: "/user/dashboard" },
					{ label: "Accounts", icon: "pi pi-user", path: "/user/accounts" },
					{ label: "Balance", icon: "pi pi-dollar", path: "/demo" },
					{ label: "Cards", icon: "pi pi-credit-card", path: "/demo" },
					{
						label: "Transactions",
						icon: "pi pi-list",
						path: "/user/transactions",
					},
				],
			},
			// {
			// 	label: "Other",
			// 	items: [
			// 		{ label: "Integrations", icon: "pi pi-sitemap" },
			// 		{ label: "Settings", icon: "pi pi-cog" },
			// 	],
			// },
		];
	}
}
