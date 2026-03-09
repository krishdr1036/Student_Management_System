import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatToolbarModule, MatButtonModule,
    MatIconModule, MatMenuModule, MatChipsModule, MatTooltipModule, MatDividerModule
  ],
  template: `
    <mat-toolbar class="navbar">
      <div class="navbar-brand" routerLink="/home">
        <mat-icon class="brand-icon">school</mat-icon>
        <span class="brand-text">EduEnroll</span>
      </div>

      <div class="spacer"></div>

      <nav class="nav-links" *ngIf="currentUser">
        <a mat-button routerLink="/home" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:true}">
          <mat-icon>home</mat-icon> Home
        </a>
        <a mat-button routerLink="/students" routerLinkActive="active-link">
          <mat-icon>people</mat-icon> Students
        </a>
        <a mat-button routerLink="/courses" routerLinkActive="active-link">
          <mat-icon>menu_book</mat-icon> Courses
        </a>
        <a mat-button routerLink="/enroll" routerLinkActive="active-link">
          <mat-icon>assignment_turned_in</mat-icon> Enroll
        </a>
      </nav>

      <div class="nav-actions">
        <ng-container *ngIf="currentUser; else loginBtn">
          <div class="user-menu" [matMenuTriggerFor]="userMenu">
            <div class="user-avatar">{{ getInitials() }}</div>
            <div class="user-info">
              <span class="user-name">{{ currentUser.username }}</span>
              <span class="user-role">{{ currentUser.role }}</span>
            </div>
            <mat-icon>arrow_drop_down</mat-icon>
          </div>
          <mat-menu #userMenu="matMenu" class="user-dropdown">
            <div class="menu-header" mat-menu-item disabled>
              <mat-icon>account_circle</mat-icon>
              Signed in as <strong>{{ currentUser.username }}</strong>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon> Sign Out
            </button>
          </mat-menu>
        </ng-container>

        <ng-template #loginBtn>
          <button mat-raised-button color="primary" routerLink="/login">
            <mat-icon>login</mat-icon> Sign In
          </button>
        </ng-template>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: sticky; top: 0; z-index: 1000;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
      color: white; box-shadow: 0 2px 20px rgba(0,0,0,0.3);
      padding: 0 24px; height: 64px;
    }
    .navbar-brand {
      display: flex; align-items: center; gap: 10px;
      cursor: pointer; text-decoration: none;
    }
    .brand-icon { font-size: 28px; height: 28px; width: 28px; color: #a5b4fc; }
    .brand-text { font-size: 1.4rem; font-weight: 700; letter-spacing: -0.5px; color: white; }
    .spacer { flex: 1; }
    .nav-links { display: flex; align-items: center; gap: 4px; }
    .nav-links a {
      color: rgba(255,255,255,0.8) !important; border-radius: 8px;
      display: flex; align-items: center; gap: 6px;
      font-weight: 500; transition: all 0.2s;
    }
    .nav-links a:hover, .nav-links a.active-link {
      color: white !important; background: rgba(255,255,255,0.15) !important;
    }
    .nav-links mat-icon { font-size: 18px; height: 18px; width: 18px; }
    .nav-actions { display: flex; align-items: center; margin-left: 16px; }
    .user-menu {
      display: flex; align-items: center; gap: 10px;
      cursor: pointer; padding: 6px 12px; border-radius: 24px;
      background: rgba(255,255,255,0.1); transition: background 0.2s;
    }
    .user-menu:hover { background: rgba(255,255,255,0.2); }
    .user-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: #6366f1; display: flex; align-items: center;
      justify-content: center; font-weight: 700; font-size: 0.8rem;
    }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-size: 0.85rem; font-weight: 600; line-height: 1.2; }
    .user-role { font-size: 0.7rem; color: #a5b4fc; text-transform: capitalize; }
    .menu-header { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: AuthUser | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
  }

  getInitials(): string {
    if (!this.currentUser) return '';
    return this.currentUser.username.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
