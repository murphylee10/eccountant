import { Component, Inject, Input } from "@angular/core";
import {
	FormBuilder,
	type FormGroup,
	Validators,
	ReactiveFormsModule,
	FormsModule,
} from "@angular/forms";
import { CommonModule, DOCUMENT } from "@angular/common";
// biome-ignore lint/style/useImportType: Angular needs the whole module for elements passed in constructor
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { ButtonModule } from "primeng/button";
// biome-ignore lint/style/useImportType: Angular needs the whole module for elements passed in constructor
import { AuthService } from "@services/auth.service";
// biome-ignore lint/style/useImportType: Angular needs the whole module for elements passed in constructor
import { ApiService } from "@services/api.service";

@Component({
	selector: "app-auth-form",
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		InputTextModule,
		PasswordModule,
		ButtonModule,
		RouterModule,
	],
	templateUrl: "./auth-form.component.html",
	styles: "",
})
export class AuthFormComponent {
	// isSignIn = true;
	// authForm: FormGroup;

	constructor(
		// @Inject(DOCUMENT) public document: Document,
		public auth: AuthService,
		// private fb: FormBuilder,
		// private route: ActivatedRoute,
		api: ApiService,
		router: Router,
	) {
		// this.authForm = this.fb.group({
		//   fullName: [''],
		//   username: ['', Validators.required],
		//   password: ['', Validators.required],
		// });
		auth.user$.subscribe((user) => {
			if (user) {
				// Extract the user ID (sub) and send it to the backend
				const userId = user.sub;
				api
					.storeUser(userId as string, user.email as string)
					.then((response) => {
						router.navigate(["/user/dashboard"]);
					})
					.catch((err) => {
						console.error("Error registering or logging in user:", err);
					});
			} else {
				this.auth.loginWithRedirect();
			}
		});
	}
}
