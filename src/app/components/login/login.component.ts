import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatChipsModule
  ],
  template: `
    <div class="login-page">
      <div class="login-bg">
        <div class="bg-shape bg-shape-1"></div>
        <div class="bg-shape bg-shape-2"></div>
        <div class="bg-shape bg-shape-3"></div>
      </div>

      <div class="login-container">
        <div class="login-brand">
          <mat-icon class="brand-icon">school</mat-icon>
          <h1>EduEnroll</h1>
          <p>Student Course Management System</p>
        </div>

        <mat-card class="login-card">
          <mat-card-header>
            <mat-card-title>Welcome Back</mat-card-title>
            <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Username</mat-label>
                <input matInput formControlName="username" placeholder="Enter username">
                <mat-icon matPrefix>person</mat-icon>
                <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                  Username is required
                </mat-error>
                <mat-error *ngIf="loginForm.get('username')?.hasError('minlength')">
                  Username must be at least 3 characters
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input matInput [type]="hidePassword ? 'password' : 'text'"
                       formControlName="password" placeholder="Enter password">
                <mat-icon matPrefix>lock</mat-icon>
                <button mat-icon-button matSuffix type="button"
                        (click)="hidePassword = !hidePassword">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                  Password must be at least 6 characters
                </mat-error>
              </mat-form-field>

              <div class="error-message" *ngIf="errorMessage">
                <mat-icon>error_outline</mat-icon>
                {{ errorMessage }}
              </div>

              <button mat-raised-button color="primary" type="submit"
                      class="full-width login-btn" [disabled]="isLoading || loginForm.invalid">
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                <mat-icon *ngIf="!isLoading">login</mat-icon>
                {{ isLoading ? 'Signing in...' : 'Sign In' }}
              </button>
            </form>
          </mat-card-content>

          <mat-card-footer>
            <div class="demo-credentials">
              <p class="demo-title">Demo Credentials:</p>
              <div class="demo-cards">
                <div class="demo-card" (click)="fillCredentials('admin', 'admin123')">
                  <mat-icon>admin_panel_settings</mat-icon>
                  <div>
                    <strong>Admin</strong>
                    <span>admin / admin123</span>
                  </div>
                </div>
                <div class="demo-card" (click)="fillCredentials('student', 'student123')">
                  <mat-icon>person</mat-icon>
                  <div>
                    <strong>Student</strong>
                    <span>student / student123</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-footer>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; position: relative; overflow: hidden;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    }
    .login-bg { position: absolute; inset: 0; pointer-events: none; }
    .bg-shape {
      position: absolute; border-radius: 50%;
      background: rgba(255,255,255,0.03);
      animation: float 8s ease-in-out infinite;
    }
    .bg-shape-1 { width: 400px; height: 400px; top: -100px; left: -100px; animation-delay: 0s; }
    .bg-shape-2 { width: 300px; height: 300px; bottom: -50px; right: -50px; animation-delay: 3s; }
    .bg-shape-3 { width: 200px; height: 200px; top: 50%; left: 50%; animation-delay: 1.5s; }
    @keyframes float {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-20px) scale(1.05); }
    }
    .login-container { position: relative; z-index: 1; width: 100%; max-width: 440px; padding: 24px; }
    .login-brand { text-align: center; margin-bottom: 32px; color: white; }
    .brand-icon { font-size: 56px; height: 56px; width: 56px; color: #a5b4fc; margin-bottom: 8px; }
    .login-brand h1 { font-size: 2rem; font-weight: 800; margin: 0; letter-spacing: -1px; }
    .login-brand p { color: rgba(255,255,255,0.6); margin: 4px 0 0; }
    .login-card { border-radius: 16px !important; box-shadow: 0 25px 50px rgba(0,0,0,0.4) !important; }
    mat-card-header { padding: 24px 24px 0; }
    mat-card-content { padding: 16px 24px; }
    mat-card-footer { padding: 0 24px 24px; }
    .full-width { width: 100%; margin-bottom: 12px; }
    .login-btn {
      height: 48px; font-size: 1rem; font-weight: 600;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .error-message {
      display: flex; align-items: center; gap: 8px;
      background: #fef2f2; color: #dc2626; padding: 12px;
      border-radius: 8px; margin-bottom: 16px; font-size: 0.9rem;
    }
    .demo-credentials { margin-top: 20px; }
    .demo-title { font-size: 0.8rem; color: #6b7280; font-weight: 600; margin-bottom: 8px; text-align: center; }
    .demo-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .demo-card {
      display: flex; align-items: center; gap: 8px;
      padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px;
      cursor: pointer; transition: all 0.2s; background: #f9fafb;
    }
    .demo-card:hover { background: #ede9fe; border-color: #6366f1; }
    .demo-card mat-icon { color: #6366f1; }
    .demo-card div { display: flex; flex-direction: column; }
    .demo-card strong { font-size: 0.8rem; }
    .demo-card span { font-size: 0.7rem; color: #6b7280; }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;
  returnUrl = '/students';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
      return;
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/students';
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  fillCredentials(username: string, password: string): void {
    this.loginForm.patchValue({ username, password });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    const { username, password } = this.loginForm.value;
    this.authService.login(username, password).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result.success) {
          this.router.navigate([this.returnUrl]);
        } else {
          this.errorMessage = result.message;
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred. Please try again.';
      }
    });
  }
}
