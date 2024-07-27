import { Component, Inject, Input } from '@angular/core';
// biome-ignore lint/style/useImportType: angular needs the whole module for elements passed in constructor
import {
  FormBuilder,
  type FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule, DOCUMENT } from '@angular/common';
// biome-ignore lint/style/useImportType: Angular needs the whole module for elements passed in constructor
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
// biome-ignore lint/style/useImportType: Angular needs the whole module for elements passed in constructor
import { AuthService } from '@auth0/auth0-angular';
// biome-ignore lint/style/useImportType: Angular needs the whole module for elements passed in constructor
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-auth-form',
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
  templateUrl: './auth-form.component.html',
  styles: '',
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
          .storeUserId(userId as string)
          .then((response) => {
            console.log('User registered or logged in:', response);
            router.navigate(['/dashboard']);
          })
          .catch((err) => {
            console.error('Error registering or logging in user:', err);
          });
      } else {
        this.auth.loginWithRedirect();
      }
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

  // onSubmit() {
  //   const username = this.authForm.get('username')?.value;
  //   const password = this.authForm.get('password')?.value;
  //   if (this.authForm.valid) {
  //     if (this.isSignIn) {
  //       console.log('Todo sign in');
  //       this.auth.login
  //     } else {
  //       const name = this.authForm.get('fullName')?.value;
  //       console.log('Todo sign up');
  //     }
  //   }
  // }
}
