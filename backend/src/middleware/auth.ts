// Authorization middleware. When used, the Access Token must

import { auth, requiredScopes } from "express-oauth2-jwt-bearer";
import "dotenv/config";

// exist and be verified against the Auth0 JSON Web Key Set.
export const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

export const requireAuthScope = (scope: string | string[]) => {
  return requiredScopes(scope);
};
