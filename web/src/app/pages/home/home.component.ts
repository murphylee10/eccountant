import { AsyncPipe, NgIf } from '@angular/common';
import {
  Component,
  Signal,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { AuthService, User } from '@auth0/auth0-angular';
import { AuthButtonComponent } from '@components/auth/auth-button/auth-button.component';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, AsyncPipe, AuthButtonComponent],
  templateUrl: './home.component.html',
  styles: ``,
})
export class HomeComponent {
  msg: string = '';

  constructor(
    public auth: AuthService,
    private api: ApiService,
  ) {
    console.log(window.origin);
  }

  async testAuth() {
    try {
      const [authenticated, authorized] = await Promise.all([
        this.api.exampleAuth(),
        this.api.exampleAuthScope(),
      ]);

      this.msg = `User is ${authenticated.success ? '' : 'not'} authenticated and ${authorized.success ? '' : 'not'} authorized`;
    } catch (e) {
      console.error(e);
    }
  }
}
