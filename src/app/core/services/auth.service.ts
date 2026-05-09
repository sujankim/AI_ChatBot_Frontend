import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../models/auth.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // ─── Reactive State (Signals) ─────────────────────────────────────────────

  /**
   * The current logged-in user.
   * null = nobody is logged in.
   * Signal: template auto-updates when this changes.
   */
  private readonly _currentUser =
    signal<UserProfile | null>(null);

  /**
   * Read-only public version of the current user.
   * Components read this but cannot set it directly.
   * Only AuthService can change who the current user is.
   */
  readonly currentUser = this._currentUser.asReadonly();

  /**
   * Access token stored in MEMORY only.
   *
   * Why NOT localStorage?
   * → localStorage is readable by JavaScript
   * → XSS attack: <script>steal(localStorage.getItem('token'))</script>
   * → If attackers inject JS into your page → token stolen
   *
   * Why in-memory?
   * → JavaScript variable — only readable by THIS app's code
   * → XSS can't access it (different scope)
   * → Downside: lost on page refresh → user must log in again
   * → Mitigated by: refresh token in HttpOnly cookie auto-restores session
   */
  private accessToken: string | null = null;

  // ─── Computed State ──────────────────────────────────────────────────────

  /**
   * True if user is logged in (has both token and user data).
   * computed() recalculates when _currentUser signal changes.
   */
  readonly isLoggedIn = computed(() =>
    this.accessToken !== null && this._currentUser() !== null);

  // ─── Auth Methods ─────────────────────────────────────────────────────────

  /**
   * Register a new user.
   * tap() = "do something with the value without changing it"
   * handleAuthSuccess stores token + user in memory.
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(tap((response) => this.handleAuthSuccess(response)));
  }

  /**
   * Login with email + password.
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(tap((response) => this.handleAuthSuccess(response)));
  }

  /**
   * Logout: clear local state + clear refresh token cookie on server.
   */
  logout(): void {
    // Tell backend to clear the HttpOnly refresh token cookie.
    // withCredentials: true = send cookies with the request.
    this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({ error: () => {} }); // Ignore errors — logout locally regardless

    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  /**
   * Use the HttpOnly refresh token cookie to get a new access token.
   * Called automatically by the interceptor when it sees a 401.
   * withCredentials: true = browser sends the HttpOnly cookie.
   */
  refreshToken(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/refresh`,
        {},
        { withCredentials: true }, // ← Sends the HttpOnly cookie to the server
      )
      .pipe(tap((response) => this.handleAuthSuccess(response)));
  }

  /**
   * Redirect browser to Spring Boot's OAuth2 endpoint.
   * Spring Security handles the redirect to Google and the callback.
   */
  loginWithGoogle(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  // ─── Token Access ─────────────────────────────────────────────────────────

  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Called by OAuthCallbackComponent after Google login redirect.
   * Spring Boot sends: /auth/callback?token=eyJhbGci...
   */
  handleOAuthCallback(token: string): void {
    // We only have the token from the URL — no UserProfile yet.
    // Decode the JWT payload to extract user info.
    const userProfile = this.decodeTokenPayload(token);
    if (userProfile) {
      this.accessToken = token;
      this._currentUser.set(userProfile);
    }
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private handleAuthSuccess(response: AuthResponse): void {
    console.log('Auth success response:', response); // ← check the full object
    this.accessToken = response.accessToken;
    this._currentUser.set(response.user);
  }

  private clearAuthState(): void {
    this.accessToken = null;
    this._currentUser.set(null);
  }

  /**
   * Decode the JWT payload to extract user info.
   * JWT payload is BASE64 encoded — readable without the secret key.
   * We only VERIFY JWTs on the backend (using the secret key).
   * On the frontend, we just READ the payload claims.
   */
  private decodeTokenPayload(token: string): UserProfile | null {
    try {
      // JWT structure: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      // atob() = decode base64 string
      // Replace characters for URL-safe base64 variant
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      return {
        id: payload['userId'],
        name: payload['name'],
        email: payload['sub'], // 'sub' is standard JWT claim for subject (email)
        role: payload['role'],
        provider: 'google',
      };
    } catch {
      return null;
    }
  }
}
