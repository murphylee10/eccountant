// auth.service.ts
import { Injectable } from "@angular/core";
import { AuthService as Auth0Service, User } from "@auth0/auth0-angular";
import { Router, NavigationEnd } from "@angular/router";
import { ApiService } from "./api.service";
import { Observable } from "rxjs";
import { tap, filter } from "rxjs/operators";

@Injectable({
	providedIn: "root",
})
export class AuthService {
	user$: Observable<User | null | undefined>;
	private landingPageRoute = "/";

	constructor(
		private auth: Auth0Service,
		private api: ApiService,
		private router: Router,
	) {
		this.user$ = this.auth.user$;
		this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe(() => {
				if (this.router.url !== this.landingPageRoute) {
					this.handleAuthentication();
				}
			});
	}

	loginWithRedirect(): void {
		this.auth.loginWithRedirect();
	}

	handleAuthCallback(): Observable<User | null> {
		return this.auth.handleRedirectCallback().pipe(
			tap((cb) => {
				if (cb.appState && cb.appState.target) {
					window.location.assign(cb.appState.target);
				}
			}),
		);
	}

	handleAuthentication(): void {
		this.user$.subscribe((user) => {
			if (user) {
				const userId = user.sub;
				this.api
					.storeUser(userId as string, user.email as string)
					.then((response) => {
						console.log("User registered or logged in:", response);
						this.router.navigate(["/user/dashboard"]);
					})
					.catch((err) => {
						console.error("Error registering or logging in user:", err);
					});
			} else {
				this.loginWithRedirect();
			}
		});
	}

	logout(): void {
		this.auth.logout();
	}
}
