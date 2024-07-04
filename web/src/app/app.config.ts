import {
	ApplicationConfig,
	importProvidersFrom,
	provideZoneChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { routes } from "./app.routes";

// Auth0
import { authHttpInterceptorFn, provideAuth0 } from "@auth0/auth0-angular";
import environment from "@environment";
import { provideHttpClient, withInterceptors } from "@angular/common/http";

export const appConfig: ApplicationConfig = {
	providers: [
		importProvidersFrom(BrowserAnimationsModule),
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideHttpClient(withInterceptors([authHttpInterceptorFn])),
		provideAuth0({
			domain: environment.auth0_domain,
			clientId: environment.auth0_client_id,
			authorizationParams: {
				redirect_uri: window.location.origin,
				audience: environment.auth0_audience,

				// Request this scope at user authentication time
				scope: "profile email read:example",
			},
			// Specify configuration for the interceptor
			httpInterceptor: {
				allowedList: [
					{
						// Match any request that starts 'https://dev-dakksf3f054vq48c.us.auth0.com/api/v2/' (note the asterisk)
						uri: `${environment.api_url}/*`,
						tokenOptions: {
							authorizationParams: {
								// The attached token should target this audience
								audience: environment.auth0_audience,
							},
						},
					},
				],
			},
		}),
	],
};
