import { Component, OnInit } from "@angular/core";
import { MenuModule } from "primeng/menu";
import { AvatarModule } from "primeng/avatar";
import { RippleModule } from "primeng/ripple";
import { CommonModule } from "@angular/common";
import { MenuItem } from "primeng/api";

@Component({
	selector: "layout-sidebar",
	standalone: true,
	imports: [
		CommonModule,
		MenuModule,
		AvatarModule,
		RippleModule,
	],
	templateUrl: "./sidebar.component.html",
	styles: "",
})
export class SidebarComponent implements OnInit {
	items: MenuItem[] = [];

	ngOnInit() {
		this.items = [
			{
				label: "Main",
				items: [
					{ label: "Account", icon: "pi pi-user", path: "/accounts" },
					{ label: "Dashboard", icon: "pi pi-home", path: "/demo" },
					{ label: "Balance", icon: "pi pi-dollar", path: "/demo" },
					{ label: "Cards", icon: "pi pi-credit-card", path: "/demo" },
					{ label: "Transactions", icon: "pi pi-list", path: "/transactions" },
					{ label: "Recipients", icon: "pi pi-users", path: "/demo" },
				],
			},
			{
				label: "Other",
				items: [
					{ label: "Integrations", icon: "pi pi-sitemap" },
					{ label: "Settings", icon: "pi pi-cog" },
					{ label: "Get Help", icon: "pi pi-question-circle" },
				],
			},
		];
	}
}
