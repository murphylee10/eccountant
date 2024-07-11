import { Routes } from "@angular/router";
import { LayoutComponent } from "./pages/layout/layout.component";
import { TransactionsComponent } from "./pages/transactions/transactions.component";
import { HomeComponent } from "./pages/home/home.component";
import { LinksComponent } from "@pages/links/links.component";
import { authGuard } from "./utils/auth.guard";
import { CreditsComponent } from "@pages/credits/credits.component";
import { AuthFormComponent } from "@components/auth/auth-form/auth-form.component";

export const routes: Routes = [
	{
		path: "user",
		component: LayoutComponent,
		children: [
			{ path: "demo", component: HomeComponent },
			{ path: "credits", component: CreditsComponent },
			{ path: "accounts", component: LinksComponent, canActivate: [authGuard] },
			{
				path: "transactions",
				component: TransactionsComponent,
				canActivate: [authGuard],
			},
			{ path: "**", redirectTo: "transactions" },
		],
	},
	{ path: "sign-in", component: AuthFormComponent, data: { isSignIn: true } },
	{ path: "sign-up", component: AuthFormComponent, data: { isSignIn: false } },
	{ path: "**", redirectTo: "transactions" },
];
