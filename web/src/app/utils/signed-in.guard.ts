import { inject } from "@angular/core";
import { Router, type CanActivateFn } from "@angular/router";
import { AuthService } from "@auth0/auth0-angular";
import { map } from "rxjs/operators";

export const signedInGuard: CanActivateFn = (route, state) => {
	const auth = inject(AuthService);
	const router = inject(Router);

	return auth.isAuthenticated$.pipe(
		map((isAuthenticated) => {
			if (isAuthenticated) {
				router.navigate(["/user/transactions"]);
				return false;
			}
			return true;
		}),
	);
};
