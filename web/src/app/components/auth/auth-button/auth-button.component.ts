import { Component, Inject } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";
import { AsyncPipe, DOCUMENT, NgIf } from "@angular/common";
import { ApiService } from "@services/api.service";

@Component({
	selector: "app-auth-button",
	standalone: true,
	imports: [NgIf, AsyncPipe],
	templateUrl: "./auth-button.component.html",
	styles: "",
})
export class AuthButtonComponent {
	// Inject the authentication service into your component through the constructor
	constructor(
		@Inject(DOCUMENT) public document: Document,
		public auth: AuthService,
		private api: ApiService,
	) {}

	ngOnInit() {
		this.auth.user$.subscribe((user) => {
			if (user) {
				// Extract the user ID (sub) and send it to the backend
				const userId = user.sub;
				this.api
					.storeUser(userId as string, user.email as string)
					.then((response) => {
						console.log("User registered or logged in:", response);
					})
					.catch((err) => {
						console.error("Error registering or logging in user:", err);
					});
			}
		});
	}
}
