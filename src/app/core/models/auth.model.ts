/**
 * What we SEND to POST /api/auth/register
 * Mirrors RegisterRequest.java
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * What we SEND to POST /api/auth/login
 * Mirrors LoginRequest.java
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * What we RECEIVE from register/login/refresh
 * Mirrors AuthResponse.java
 *
 * Note: refreshToken is NOT here.
 * It arrives as an HttpOnly cookie — JavaScript can never read it.
 * That's the security feature.
 */
export interface AuthResponse {
  accessToken: string; // "eyJhbGci..."
  tokenType: string; // Always "Bearer"
  expiresIn: number; // Seconds until access token expires (900 = 15 min)
  user: UserProfile; // Basic user info embedded in response
}

/**
 * User info returned after login/register
 * Mirrors UserResponse.java
 */
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string; // "ROLE_USER" or "ROLE_ADMIN"
  provider: string; // "local" or "google"
}
