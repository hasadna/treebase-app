import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from 'firebase/auth';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  authLoading = false;
  imageError = false;

  constructor(
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  get isAuthEnabled(): boolean {
    return this.authService.isAuthEnabled;
  }

  get isConfigValid(): boolean {
    return this.authService.isConfigValid;
  }

  get configError(): string | null {
    return this.authService.configError;
  }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.imageError = false;
    });
  }

  onImageError(): void {
    console.warn('[HeaderComponent] Profile image failed to load, falling back to icon.');
    this.imageError = true;
  }

  loginWithGoogle(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.isAuthEnabled) {
      return;
    }
    if (!this.isConfigValid) {
      this.snackBar.open('auth configuration error', 'סגור', { duration: 4000 });
      return;
    }
    this.authLoading = true;
    this.authService.loginWithGoogle().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.imageError = false;
        this.authLoading = false;
        this.snackBar.open(`שלום, ${user.displayName || user.email}!`, 'סגור', { duration: 4000 });
      },
      error: (err) => {
        console.error('Google auth error:', err);
        this.authLoading = false;
        this.snackBar.open('התחברות באמצעות Google נכשלה', 'סגור', { duration: 4000 });
      }
    });
  }

  logout(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.authService.logout().subscribe({
      next: () => {
        this.currentUser = null;
        this.imageError = false;
        this.snackBar.open('התנתקת בהצלחה', 'סגור', { duration: 3000 });
      }
    });
  }
}
