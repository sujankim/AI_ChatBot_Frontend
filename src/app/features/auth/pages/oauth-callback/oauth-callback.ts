import { Component, inject, OnInit } from '@angular/core';
import { NotificationService } from '../../../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-oauth-callback',
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './oauth-callback.html',
  styleUrl: './oauth-callback.scss',
})
export class OauthCallback implements OnInit{
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  isProcessing = true;
  errorMessage = '';

  ngOnInit(): void {
    // Read query parameters from the URL
    // Spring Boot redirects to: /auth/callback?token=eyJhbGci...
    // Or on error:              /auth/callback?error=oauth2_failed
    const token = this.route.snapshot.queryParamMap.get('token');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error) {
      this.handleError(error);
      return;
    }

    if (token) {
      this.handleSuccess(token);
      return;
    }

    // Neither token nor error → something unexpected happened
    this.handleError('unexpected');
  }

  private handleSuccess(token: string): void {
    this.authService.handleOAuthCallback(token);

    if (this.authService.isLoggedIn()) {
      this.notification.success('Signed in with Google successfully!');
      this.router.navigate(['/chat']);
    } else {
      this.handleError('token_invalid');
    }
  }

  private handleError(errorCode: string): void {
    this.isProcessing = false;

    const messages: Record<string, string> = {
      oauth2_failed: 'Google sign-in failed. Please try again.',
      email_not_provided: 'Google did not share your email. Please allow email access.',
      token_invalid: 'Authentication token was invalid. Please try again.',
      unexpected: 'An unexpected error occurred. Redirecting to login...',
    };

    this.errorMessage = messages[errorCode] ?? 'Sign-in failed. Redirecting...';
    this.notification.error(this.errorMessage);

    // Redirect to login after a short delay so user reads the error
    setTimeout(() => this.router.navigate(['/login']), 2500);
  }
}

