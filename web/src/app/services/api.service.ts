import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@auth0/auth0-angular';
import environment from '@environment';
import { take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) { }

  exampleAuth() {
    return new Promise<{
      success: boolean;
      msg: string;
    }>((res) => {
      this.http
        .get<{
          success: boolean;
          msg: string;
        }>(encodeURI(`${environment.api_url}/example/auth`))
        .pipe(take(1))
        .subscribe(res, (err) => res({ success: false, msg: err }));
    });
  }

  async exampleAuthScope() {
    return new Promise<{
      success: boolean;
      msg: string;
    }>((res) => {
      this.http
        .get<{
          success: boolean;
          msg: string;
        }>(encodeURI(`${environment.api_url}/example/authScope`))
        .pipe(take(1))
        .subscribe(res, (err) => res({ success: false, msg: err }));
    });
  }
}
