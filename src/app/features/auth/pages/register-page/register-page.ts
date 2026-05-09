import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

/**
 * Cross-field validator: checks that password === confirmPassword.
 * Attached to the FORM GROUP (not individual field).
 * Returns null (valid) or { passwordMismatch: true } (invalid).
 */
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // ─── Form ────────────────────────────────────────────────────────────────────
  registerForm: FormGroup = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }, // ← Cross-field validation
  );

  isLoading = signal<boolean>(false);
  hidePassword = signal<boolean>(true);
  hideConfirm = signal<boolean>(true);

  // ─── Actions ─────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (this.isLoading()) return;
    this.isLoading.set(true);

    // Only send what the backend needs (not confirmPassword)
    const { name, email, password } = this.registerForm.value;

    this.authService.register({ name, email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.notification.success(`Welcome, ${name}! Your account is ready.`);
        this.router.navigate(['/chat']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err.error?.message ?? 'Registration failed. Please try again.';
        this.notification.error(message);
      },
    });
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  hasError(field: string, error: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control?.hasError(error) && control?.touched);
  }

  hasFormError(error: string): boolean {
    return !!(
      this.registerForm.hasError(error) && this.registerForm.get('confirmPassword')?.touched
    );
  }
}


