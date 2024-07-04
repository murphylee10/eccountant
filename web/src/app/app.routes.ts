import { Routes } from "@angular/router";
import { LayoutComponent } from "./pages/layout/layout.component";
import { TransactionsComponent } from "./pages/transactions/transactions.component";
import { HomeComponent } from "./pages/home/home.component";
import { LinksComponent } from "@pages/links/links.component";
import { authGuard } from "./utils/auth.guard";

export const routes: Routes = [
	{
		path: "",
		component: LayoutComponent,
		children: [
			{ path: "", component: HomeComponent },
			{ path: "accounts", component: LinksComponent, canActivate: [authGuard] },
			{
				path: "transactions",
				component: TransactionsComponent,
				canActivate: [authGuard],
			},
		],
	},
	{ path: "**", component: HomeComponent },
];
