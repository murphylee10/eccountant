import { Component, Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { AsyncPipe, DOCUMENT, NgIf } from '@angular/common';

@Component({
  selector: 'app-auth-button',
  standalone: true,
  imports: [NgIf, AsyncPipe],
  templateUrl: './auth-button.component.html',
  styles: ``,
})
export class AuthButtonComponent {
  // Inject the authentication service into your component through the constructor
  constructor(
    @Inject(DOCUMENT) public document: Document,
    public auth: AuthService,
  ) { }
}
