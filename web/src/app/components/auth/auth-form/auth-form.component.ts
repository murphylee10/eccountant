import { Component, Input } from "@angular/core";
// biome-ignore lint/style/useImportType: angular needs the whole module for elements passed in constructor
import {
	FormBuilder,
	type FormGroup,
	Validators,
	ReactiveFormsModule,
	FormsModule,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
// biome-ignore lint/style/useImportType: Angular needs the whole module for elements passed in constructor
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { ButtonModule } from "primeng/button";

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
	isSignIn = true;
	authForm: FormGroup;

	constructor(
		private fb: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
	) {
		this.authForm = this.fb.group({
			fullName: [""],
			username: ["", Validators.required],
			password: ["", Validators.required],
		});
	}

	ngOnInit(): void {
		this.route.data.subscribe((data) => {
			// biome-ignore lint/complexity/useLiteralKeys: <explanation>
			this.isSignIn = data["isSignIn"];
		});
	}

	// ngOnChanges() {
	// 	if (this.isSignIn) {
	// 		this.authForm.get("fullName")?.clearValidators();
	// 	} else {
	// 		this.authForm.get("fullName")?.setValidators(Validators.required);
	// 	}
	// 	this.authForm.get("fullName")?.updateValueAndValidity();
	// }

	onSubmit() {
		if (this.authForm.valid) {
			if (this.isSignIn) {
				console.log("Todo sign in");
			} else {
				console.log("Todo sign up");
			}
		}
	}
}
