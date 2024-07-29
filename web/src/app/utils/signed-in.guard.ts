import { inject } from "@angular/core";
import { Router, type CanActivateFn } from "@angular/router";
import { AuthService } from "@services/auth.service"; // Import the new AuthService
import { map } from "rxjs/operators";

export const signedInGuard: CanActivateFn = (route, state) => {
	const auth = inject(AuthService);
	const router = inject(Router);

	return auth.user$.pipe(
		map((user) => {
			if (user) {
				router.navigate(["/user/dashboard"]);
				return false;
			}
			return true;
		}),
	);
};
