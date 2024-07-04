import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";

export const redirectGuard: CanActivateFn = (route, state) => {
	const router = inject(Router);
	router.navigate(["/home"]);
	return false; // Prevents navigation to the guarded route
};
