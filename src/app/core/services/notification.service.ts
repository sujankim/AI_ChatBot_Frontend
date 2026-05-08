import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  // ─── Base Config ──────────────────────────────────────────────────────────
  private readonly baseConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
  };

  // ─── Public Methods ───────────────────────────────────────────────────────
  /**
   * Shows a success notification (green).
   * Use for: completed actions (deleted, created, saved)
   */
  success(message: string) {
    this.snackBar.open(message, 'Close', {
      ...this.baseConfig,
      panelClass: ['snack-success'],
    });
  }

  /**
   * Shows an error notification (red).
   * Use for: failed API calls, unexpected errors
   */
  error(message: string) {
    this.snackBar.open(message, 'Close', {
      ...this.baseConfig,
      duration: 5000,
      panelClass: ['snack-error'],
    });
  }

  /**
   * Shows an info notification (blue).
   * Use for: neutral informational messages
   */
  info(message: string) {
    this.snackBar.open(message, 'Close', {
      ...this.baseConfig,
      panelClass: ['snack-info'],
    });
  }
}
