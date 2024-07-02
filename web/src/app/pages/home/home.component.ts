import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { AuthButtonComponent } from '@components/auth/auth-button/auth-button.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, AsyncPipe, AuthButtonComponent],
  templateUrl: './home.component.html',
  styles: ``,
})
export class HomeComponent {
  constructor(public auth: AuthService) { }
}
