import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { AuthService } from "@auth0/auth0-angular";
import { map } from "rxjs/operators";

export const authGuard: CanActivateFn = (route, state) => {
	const auth = inject(AuthService);
	const router = inject(Router);

	return auth.isAuthenticated$.pipe(
		map((isAuthenticated) => {
			if (!isAuthenticated) {
				router.navigate(["/sign-in"]);
				return false;
			}
			return true;
		}),
	);
};
