import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { combineLatest } from 'rxjs';
import { StudentService } from '../../services/student.service';
import { CourseService } from '../../services/course.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <div class="hero-badge">
            <mat-icon>auto_awesome</mat-icon> Student Management System
          </div>
          <h1 class="hero-title">Manage Courses &<br><span class="accent">Enrollments</span> Seamlessly</h1>
          <p class="hero-subtitle">
            A comprehensive platform for managing students, courses, and academic enrollments
            with real-time updates and intuitive workflows.
          </p>
          <div class="hero-actions">
            <button mat-raised-button routerLink="/students" class="btn-primary">
              <mat-icon>people</mat-icon> View Students
            </button>
            <button mat-stroked-button routerLink="/courses" class="btn-secondary">
              <mat-icon>menu_book</mat-icon> Browse Courses
            </button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="stat-grid">
            <div class="stat-card stat-card--primary">
              <mat-icon>people</mat-icon>
              <span class="stat-num">{{ stats.totalStudents }}</span>
              <span class="stat-label">Students</span>
            </div>
            <div class="stat-card stat-card--secondary">
              <mat-icon>menu_book</mat-icon>
              <span class="stat-num">{{ stats.totalCourses }}</span>
              <span class="stat-label">Courses</span>
            </div>
            <div class="stat-card stat-card--success">
              <mat-icon>assignment_turned_in</mat-icon>
              <span class="stat-num">{{ stats.totalEnrollments }}</span>
              <span class="stat-label">Enrollments</span>
            </div>
            <div class="stat-card stat-card--warning">
              <mat-icon>school</mat-icon>
              <span class="stat-num">{{ stats.activeStudents }}</span>
              <span class="stat-label">Active</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="features">
        <h2 class="section-title">Everything You Need</h2>
        <div class="features-grid">
          <div class="feature-card" routerLink="/students">
            <div class="feature-icon feature-icon--blue">
              <mat-icon>manage_accounts</mat-icon>
            </div>
            <h3>Student Management</h3>
            <p>Add, view, and manage student profiles. Track departments, status, and enrollment history.</p>
            <div class="feature-link">Manage Students <mat-icon>arrow_forward</mat-icon></div>
          </div>
          <div class="feature-card" routerLink="/courses">
            <div class="feature-icon feature-icon--purple">
              <mat-icon>library_books</mat-icon>
            </div>
            <h3>Course Catalog</h3>
            <p>Browse all available courses with seat availability, credits, schedule, and instructor info.</p>
            <div class="feature-link">View Courses <mat-icon>arrow_forward</mat-icon></div>
          </div>
          <div class="feature-card" routerLink="/enroll">
            <div class="feature-icon feature-icon--green">
              <mat-icon>how_to_reg</mat-icon>
            </div>
            <h3>Enrollment Portal</h3>
            <p>Enroll students into courses with validation, confirmation dialogs, and instant feedback.</p>
            <div class="feature-link">Start Enrolling <mat-icon>arrow_forward</mat-icon></div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta" *ngIf="!isLoggedIn">
        <mat-icon>lock_open</mat-icon>
        <h2>Ready to get started?</h2>
        <p>Sign in to access all features of the system.</p>
        <button mat-raised-button routerLink="/login" class="btn-primary">
          <mat-icon>login</mat-icon> Sign In Now
        </button>
      </section>
    </div>
  `,
  styles: [`
    .home-page { max-width: 1200px; margin: 0 auto; padding: 0 24px 60px; }

    /* Hero */
    .hero {
      display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
      align-items: center; padding: 60px 0 80px;
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: #ede9fe; color: #6366f1; padding: 6px 16px;
      border-radius: 20px; font-size: 0.85rem; font-weight: 600; margin-bottom: 20px;
    }
    .hero-title {
      font-size: 3.2rem; font-weight: 800; line-height: 1.1;
      color: #0f172a; margin: 0 0 20px; letter-spacing: -1.5px;
    }
    .accent { color: #6366f1; }
    .hero-subtitle { font-size: 1.1rem; color: #475569; line-height: 1.7; margin-bottom: 32px; }
    .hero-actions { display: flex; gap: 16px; }
    .btn-primary {
      background: #6366f1 !important; color: white !important;
      height: 48px; padding: 0 24px; font-size: 1rem; font-weight: 600;
      display: flex; align-items: center; gap: 8px; border-radius: 10px !important;
    }
    .btn-secondary {
      height: 48px; padding: 0 24px; font-size: 1rem; font-weight: 600;
      display: flex; align-items: center; gap: 8px; border-radius: 10px !important;
      border-color: #6366f1 !important; color: #6366f1 !important;
    }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .stat-card {
      border-radius: 16px; padding: 24px; display: flex; flex-direction: column;
      align-items: center; gap: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: transform 0.2s;
    }
    .stat-card:hover { transform: translateY(-4px); }
    .stat-card mat-icon { font-size: 28px; height: 28px; width: 28px; }
    .stat-num { font-size: 2rem; font-weight: 800; line-height: 1; }
    .stat-label { font-size: 0.8rem; font-weight: 500; opacity: 0.7; }
    .stat-card--primary { background: linear-gradient(135deg, #6366f1, #818cf8); color: white; }
    .stat-card--secondary { background: linear-gradient(135deg, #8b5cf6, #a78bfa); color: white; }
    .stat-card--success { background: linear-gradient(135deg, #10b981, #34d399); color: white; }
    .stat-card--warning { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white; }

    /* Features */
    .features { padding: 40px 0; }
    .section-title { font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 40px; color: #0f172a; }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .feature-card {
      padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px;
      cursor: pointer; transition: all 0.2s; background: white;
    }
    .feature-card:hover { box-shadow: 0 12px 40px rgba(99,102,241,0.15); border-color: #6366f1; transform: translateY(-4px); }
    .feature-icon {
      width: 56px; height: 56px; border-radius: 14px; display: flex;
      align-items: center; justify-content: center; margin-bottom: 20px;
    }
    .feature-icon mat-icon { font-size: 28px; height: 28px; width: 28px; }
    .feature-icon--blue { background: #dbeafe; color: #3b82f6; }
    .feature-icon--purple { background: #ede9fe; color: #6366f1; }
    .feature-icon--green { background: #d1fae5; color: #10b981; }
    .feature-card h3 { font-size: 1.15rem; font-weight: 700; margin: 0 0 10px; color: #0f172a; }
    .feature-card p { color: #475569; line-height: 1.6; font-size: 0.95rem; margin: 0 0 20px; }
    .feature-link { display: flex; align-items: center; gap: 4px; color: #6366f1; font-weight: 600; font-size: 0.9rem; }
    .feature-link mat-icon { font-size: 16px; height: 16px; width: 16px; }

    /* CTA */
    .cta {
      text-align: center; padding: 60px 40px; background: linear-gradient(135deg, #ede9fe, #dbeafe);
      border-radius: 20px; margin-top: 40px;
    }
    .cta mat-icon { font-size: 40px; height: 40px; width: 40px; color: #6366f1; }
    .cta h2 { font-size: 1.8rem; font-weight: 700; margin: 12px 0 8px; color: #0f172a; }
    .cta p { color: #475569; margin-bottom: 24px; }

    @media (max-width: 768px) {
      .hero { grid-template-columns: 1fr; gap: 40px; padding: 40px 0; }
      .hero-title { font-size: 2.2rem; }
      .features-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class HomeComponent implements OnInit {
  stats = { totalStudents: 0, totalCourses: 0, totalEnrollments: 0, activeStudents: 0 };
  isLoggedIn = false;

  constructor(
    private studentService: StudentService,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.authService.currentUser$.subscribe(u => this.isLoggedIn = !!u);

    combineLatest([
      this.studentService.getStudents(),
      this.courseService.getCourses(),
      this.enrollmentService.getEnrollments()
    ]).subscribe(([students, courses, enrollments]) => {
      this.stats = {
        totalStudents: students.length,
        totalCourses: courses.length,
        totalEnrollments: enrollments.filter(e => e.status === 'enrolled').length,
        activeStudents: students.filter(s => s.status === 'active').length
      };
    });
  }
}
