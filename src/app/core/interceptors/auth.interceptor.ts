import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * Two jobs:
 * 1. Attach JWT to every request (Authorization header)
 * 2. Handle 401 errors: try refresh → retry → or logout
 */
export const authInterceptor: HttpInterceptorFn =
  (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ── Job 1: Skip auth endpoints ──────────────────────────────────────────
  // Auth endpoints don't need a token (they're how you GET a token)
  // Also prevents infinite loop: refresh fails → 401 → try refresh → ...
  if (isAuthRequest(req)) {
    return next(req);
  }

  // ── Job 1: Attach token ──────────────────────────────────────────────────
  const token = authService.getAccessToken();
  const authenticatedReq = attachToken(req, token);

  // ── Job 2: Handle 401 → refresh → retry ─────────────────────────────────
  return next(authenticatedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 Unauthorized (token expired)
      if (error.status === 401) {
        return handleUnauthorized(req, next, authService, router);
      }

      // All other errors pass through unchanged
      return throwError(() => error);
    }),
  );
};

// ─── Private Helper Functions ──────────────────────────────────────────────

/**
 * Check if this request is to an auth endpoint.
 * These never need a token attached.
 */
function isAuthRequest(req: HttpRequest<unknown>): boolean {
  return req.url.includes('/api/auth/');
}

/**
 * Clone the request and add Authorization header.
 * Requests are IMMUTABLE in Angular — you must clone to modify.
 */
function attachToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (!token) return req; // No token → return original request unchanged

  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Handle a 401 response:
 * 1. Try to refresh the access token
 * 2. Retry the original request with the new token
 * 3. If refresh fails → logout
 */
function handleUnauthorized(
  originalReq: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router,
) {
  return authService.refreshToken().pipe(
    switchMap(() => {
      // Refresh succeeded → get the new token
      const newToken = authService.getAccessToken();

      // Retry the ORIGINAL failed request with the new token
      const retryReq = attachToken(originalReq, newToken);
      return next(retryReq);
    }),

    catchError((refreshError) => {
      // Refresh also failed (refresh token expired or invalid)
      // User must log in again
      authService.logout();
      router.navigate(['/login'], {
        queryParams: { reason: 'session_expired' },
      });
      return throwError(() => refreshError);
    }),
  );
}
