import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const authCallbackGuard: CanActivateFn = (route, state) => {
  const queryParams = route.queryParams;
  const router = inject(Router);

  // biome-ignore lint/complexity/useLiteralKeys: angular complains otherwise
  if (queryParams['code'] && queryParams['state']) {
    // Handle Auth0 callback and redirect to user/transactions
    router.navigate(['/user/transactions']);
    return false;
  }
  return true;
};
