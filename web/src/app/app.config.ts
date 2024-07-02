import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

// Auth0
import { provideAuth0 } from '@auth0/auth0-angular';
import environment from '@environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAuth0({
      domain: environment.auth0_domain,
      clientId: environment.auth0_client_id,
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    }),
  ],
};
