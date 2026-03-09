import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { switchMap, combineLatest } from 'rxjs';
import { Student } from '../../models/student.model';
import { Course } from '../../models/course.model';
import { StudentService } from '../../services/student.service';
import { CourseService } from '../../services/course.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { Enrollment } from '../../models/enrollment.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatDividerModule, MatTableModule,
    MatSnackBarModule, MatDialogModule
  ],
  template: `
    <div class="page-container" *ngIf="student; else loading">
      <!-- Header -->
      <div class="detail-header">
        <button mat-icon-button routerLink="/students" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="student-hero">
          <div class="student-avatar large" [ngClass]="'avatar--' + student.status">
            {{ getInitials() }}
          </div>
          <div>
            <h1>{{ student.firstName }} {{ student.lastName }}</h1>
            <p class="student-email"><mat-icon>email</mat-icon> {{ student.email }}</p>
            <span class="status-badge" [ngClass]="'status-' + student.status">
              {{ student.status }}
            </span>
          </div>
        </div>
      </div>

      <div class="detail-grid">
        <!-- Info Card -->
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title><mat-icon>info</mat-icon> Student Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Student ID</span>
                <span class="info-value">#{{ student.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Department</span>
                <span class="info-value dept">{{ student.department }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone</span>
                <span class="info-value">{{ student.phone || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Enrolled Since</span>
                <span class="info-value">{{ student.enrollmentDate | date:'longDate' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Courses Enrolled</span>
                <span class="info-value highlight">{{ enrolledCourses.length }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Enrolled Courses -->
        <mat-card class="courses-card">
          <mat-card-header>
            <mat-card-title><mat-icon>menu_book</mat-icon> Enrolled Courses</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="enrolledCourses.length > 0; else noCourses">
              <div class="enrolled-course" *ngFor="let item of enrolledCourseDetails">
                <div class="course-info">
                  <span class="course-code">{{ item.course.code }}</span>
                  <span class="course-name">{{ item.course.name }}</span>
                  <span class="course-instructor">{{ item.course.instructor }}</span>
                </div>
                <div class="course-meta">
                  <span class="credits">{{ item.course.credits }} cr</span>
                  <span class="enroll-date">{{ item.enrollment.enrollmentDate | date:'MMM d' }}</span>
                  <span class="enroll-status" [ngClass]="'enroll-' + item.enrollment.status">
                    {{ item.enrollment.status }}
                  </span>
                  <button mat-icon-button color="warn" (click)="dropCourse(item)"
                          matTooltip="Drop Course">
                    <mat-icon>remove_circle</mat-icon>
                  </button>
                </div>
              </div>
            </div>
            <ng-template #noCourses>
              <div class="empty-state">
                <mat-icon>school</mat-icon>
                <p>No courses enrolled</p>
                <button mat-raised-button color="primary" routerLink="/enroll">
                  Enroll in Courses
                </button>
              </div>
            </ng-template>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading">
        <mat-icon>person_search</mat-icon>
        <p>Student not found</p>
        <button mat-raised-button routerLink="/students">Back to Students</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .page-container { max-width: 1000px; margin: 0 auto; padding: 32px 24px; }
    .detail-header { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
    .back-btn { background: white !important; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .student-hero { display: flex; align-items: center; gap: 20px; }
    .student-avatar.large {
      width: 80px; height: 80px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-size: 1.6rem; font-weight: 800;
    }
    .avatar--active { background: #d1fae5; color: #065f46; }
    .avatar--inactive { background: #fef3c7; color: #92400e; }
    .avatar--graduated { background: #dbeafe; color: #1e40af; }
    h1 { font-size: 1.8rem; font-weight: 700; margin: 0 0 6px; }
    .student-email { display: flex; align-items: center; gap: 6px; color: #64748b; margin: 0 0 8px; font-size: 0.9rem; }
    .student-email mat-icon { font-size: 16px; height: 16px; width: 16px; }
    .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; text-transform: capitalize; }
    .status-active { background: #d1fae5; color: #065f46; }
    .status-inactive { background: #fef3c7; color: #92400e; }
    .status-graduated { background: #dbeafe; color: #1e40af; }
    .detail-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; }
    mat-card { border-radius: 12px !important; }
    mat-card-title { display: flex; align-items: center; gap: 8px; font-size: 1rem !important; }
    .info-grid { display: flex; flex-direction: column; gap: 16px; padding: 8px 0; }
    .info-item { display: flex; flex-direction: column; gap: 4px; }
    .info-label { font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 0.95rem; font-weight: 500; color: #0f172a; }
    .info-value.dept { background: #ede9fe; color: #5b21b6; padding: 2px 10px; border-radius: 10px; display: inline-block; }
    .info-value.highlight { background: #dbeafe; color: #1d4ed8; padding: 2px 10px; border-radius: 10px; display: inline-block; font-weight: 700; }
    .enrolled-course {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 0; border-bottom: 1px solid #f1f5f9;
    }
    .enrolled-course:last-child { border-bottom: none; }
    .course-info { display: flex; flex-direction: column; gap: 3px; }
    .course-code { font-size: 0.75rem; font-weight: 700; color: #6366f1; }
    .course-name { font-weight: 600; color: #0f172a; font-size: 0.95rem; }
    .course-instructor { font-size: 0.8rem; color: #64748b; }
    .course-meta { display: flex; align-items: center; gap: 10px; }
    .credits { background: #f1f5f9; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; color: #475569; }
    .enroll-date { font-size: 0.8rem; color: #94a3b8; }
    .enroll-status { padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
    .enroll-enrolled { background: #d1fae5; color: #065f46; }
    .enroll-dropped { background: #fee2e2; color: #991b1b; }
    .empty-state { text-align: center; padding: 32px; }
    .empty-state mat-icon { font-size: 40px; height: 40px; width: 40px; color: #cbd5e1; }
    .empty-state p { color: #94a3b8; margin: 8px 0 16px; }
    .loading { text-align: center; padding: 80px; color: #94a3b8; }
    .loading mat-icon { font-size: 48px; height: 48px; width: 48px; }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }
  `]
})
export class StudentDetailComponent implements OnInit {
  student: Student | undefined;
  enrolledCourses: Course[] = [];
  enrolledCourseDetails: Array<{ course: Course; enrollment: Enrollment }> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    combineLatest([
      this.studentService.getStudentById(id),
      this.enrollmentService.getEnrollmentsByStudent(id),
      this.courseService.getCourses()
    ]).subscribe(([student, enrollments, courses]) => {
      this.student = student;
      if (!student) return;
      const activeEnrollments = enrollments.filter(e => e.status === 'enrolled');
      this.enrolledCourseDetails = activeEnrollments
        .map(enrollment => {
          const course = courses.find(c => c.id === enrollment.courseId);
          return course ? { course, enrollment } : null;
        })
        .filter((x): x is { course: Course; enrollment: Enrollment } => x !== null);
      this.enrolledCourses = this.enrolledCourseDetails.map(d => d.course);
    });
  }

  getInitials(): string {
    if (!this.student) return '';
    return `${this.student.firstName[0]}${this.student.lastName[0]}`.toUpperCase();
  }

  dropCourse(item: { course: Course; enrollment: Enrollment }): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Drop Course',
        message: `Drop ${item.course.name}? This will update the course seat count.`,
        confirmText: 'Drop Course',
        type: 'warning'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.enrollmentService.dropEnrollment(item.enrollment.id).subscribe({
          next: () => this.snackBar.open('Course dropped.', 'Close', { duration: 3000 }),
          error: (e) => this.snackBar.open(e.message, 'Close', { duration: 3000 })
        });
      }
    });
  }
}
