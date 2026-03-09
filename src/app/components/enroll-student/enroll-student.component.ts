import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { combineLatest } from 'rxjs';
import { Student } from '../../models/student.model';
import { Course } from '../../models/course.model';
import { Enrollment } from '../../models/enrollment.model';
import { StudentService } from '../../services/student.service';
import { CourseService } from '../../services/course.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-enroll-student',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatStepperModule, MatProgressBarModule,
    MatChipsModule, MatSnackBarModule, MatDialogModule, MatTableModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1><mat-icon>how_to_reg</mat-icon> Course Enrollment</h1>
          <p>Enroll students in available courses</p>
        </div>
      </div>

      <div class="enrollment-layout">
        <!-- Enrollment Form -->
        <div class="form-section">
          <mat-card class="enroll-card">
            <mat-card-header>
              <mat-card-title>New Enrollment</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-stepper #stepper orientation="vertical" [linear]="true">

                <!-- Step 1: Select Student -->
                <mat-step [stepControl]="step1Form" label="Select Student">
                  <form [formGroup]="step1Form" class="step-form">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Search & Select Student</mat-label>
                      <mat-select formControlName="studentId">
                        <mat-option>
                          <input class="mat-select-search" placeholder="Search students..."
                                 (keyup)="filterStudents($event)">
                        </mat-option>
                        <mat-option *ngFor="let student of filteredStudents"
                          [value]="student.id" [disabled]="student.status !== 'active'">
                          <div class="option-content">
                            <span class="option-main">{{ student.firstName }} {{ student.lastName }}</span>
                            <span class="option-sub">{{ student.department }} • {{ student.status }}</span>
                          </div>
                        </mat-option>
                      </mat-select>
                      <mat-error *ngIf="step1Form.get('studentId')?.hasError('required')">
                        Please select a student
                      </mat-error>
                    </mat-form-field>

                    <!-- Selected Student Preview -->
                    <div class="selected-preview" *ngIf="selectedStudent">
                      <div class="preview-avatar">{{ getStudentInitials(selectedStudent) }}</div>
                      <div class="preview-info">
                        <strong>{{ selectedStudent.firstName }} {{ selectedStudent.lastName }}</strong>
                        <span>{{ selectedStudent.email }}</span>
                        <span>{{ selectedStudent.department }}</span>
                      </div>
                      <span class="preview-stat">
                        <mat-icon>school</mat-icon> {{ selectedStudent.enrolledCourses.length }} courses
                      </span>
                    </div>

                    <div class="step-actions">
                      <button mat-raised-button color="primary" matStepperNext
                              [disabled]="step1Form.invalid">
                        Next <mat-icon>arrow_forward</mat-icon>
                      </button>
                    </div>
                  </form>
                </mat-step>

                <!-- Step 2: Select Course -->
                <mat-step [stepControl]="step2Form" label="Select Course">
                  <form [formGroup]="step2Form" class="step-form">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Select Course</mat-label>
                      <mat-select formControlName="courseId">
                        <mat-option *ngFor="let course of availableCourses"
                          [value]="course.id"
                          [disabled]="course.status === 'closed' || isAlreadyEnrolled(course.id)">
                          <div class="option-content">
                            <span class="option-main">{{ course.code }} – {{ course.name }}</span>
                            <span class="option-sub">
                              {{ course.totalSeats - course.enrolledCount }} seats •
                              {{ course.status }}
                              <span *ngIf="isAlreadyEnrolled(course.id)"> • Already enrolled</span>
                            </span>
                          </div>
                        </mat-option>
                      </mat-select>
                      <mat-error *ngIf="step2Form.get('courseId')?.hasError('required')">
                        Please select a course
                      </mat-error>
                    </mat-form-field>

                    <!-- Selected Course Preview -->
                    <div class="course-preview" *ngIf="selectedCourse">
                      <div class="course-preview-header">
                        <span class="code">{{ selectedCourse.code }}</span>
                        <span class="status-badge" [ngClass]="'status-' + selectedCourse.status">
                          {{ selectedCourse.status }}
                        </span>
                      </div>
                      <h3>{{ selectedCourse.name }}</h3>
                      <p>{{ selectedCourse.description }}</p>
                      <div class="course-preview-stats">
                        <span><mat-icon>person</mat-icon> {{ selectedCourse.instructor }}</span>
                        <span><mat-icon>star</mat-icon> {{ selectedCourse.credits }} Credits</span>
                        <span><mat-icon>attach_money</mat-icon> {{ selectedCourse.fee | currency }}</span>
                      </div>
                      <div class="seats-bar">
                        <span>Seats: {{ selectedCourse.totalSeats - selectedCourse.enrolledCount }} remaining</span>
                        <mat-progress-bar
                          [value]="(selectedCourse.enrolledCount / selectedCourse.totalSeats) * 100"
                          [color]="selectedCourse.status === 'closed' ? 'warn' : 'primary'">
                        </mat-progress-bar>
                      </div>
                    </div>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Notes (optional)</mat-label>
                      <textarea matInput formControlName="notes" rows="3"
                        placeholder="Any special notes for this enrollment..."></textarea>
                    </mat-form-field>

                    <div class="step-actions">
                      <button mat-button matStepperPrevious>Back</button>
                      <button mat-raised-button color="primary" matStepperNext
                              [disabled]="step2Form.invalid">
                        Review <mat-icon>arrow_forward</mat-icon>
                      </button>
                    </div>
                  </form>
                </mat-step>

                <!-- Step 3: Confirm -->
                <mat-step label="Confirm Enrollment">
                  <div class="confirm-step" *ngIf="selectedStudent && selectedCourse">
                    <div class="confirm-section">
                      <h4>Enrollment Summary</h4>
                      <div class="summary-row">
                        <span class="summary-label">Student</span>
                        <span>{{ selectedStudent.firstName }} {{ selectedStudent.lastName }}</span>
                      </div>
                      <div class="summary-row">
                        <span class="summary-label">Course</span>
                        <span>{{ selectedCourse.code }} – {{ selectedCourse.name }}</span>
                      </div>
                      <div class="summary-row">
                        <span class="summary-label">Instructor</span>
                        <span>{{ selectedCourse.instructor }}</span>
                      </div>
                      <div class="summary-row">
                        <span class="summary-label">Credits</span>
                        <span>{{ selectedCourse.credits }}</span>
                      </div>
                      <div class="summary-row">
                        <span class="summary-label">Fee</span>
                        <span class="fee-amount">{{ selectedCourse.fee | currency }}</span>
                      </div>
                      <div class="summary-row" *ngIf="step2Form.get('notes')?.value">
                        <span class="summary-label">Notes</span>
                        <span>{{ step2Form.get('notes')?.value }}</span>
                      </div>
                    </div>

                    <div class="step-actions">
                      <button mat-button matStepperPrevious>Back</button>
                      <button mat-raised-button color="primary"
                              (click)="submitEnrollment()" [disabled]="isSubmitting">
                        <mat-icon>check_circle</mat-icon>
                        {{ isSubmitting ? 'Enrolling...' : 'Confirm Enrollment' }}
                      </button>
                    </div>
                  </div>
                </mat-step>

              </mat-stepper>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Recent Enrollments -->
        <div class="history-section">
          <mat-card class="history-card">
            <mat-card-header>
              <mat-card-title><mat-icon>history</mat-icon> Recent Enrollments</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="enrollment-list">
                <div class="enrollment-item" *ngFor="let item of recentEnrollments">
                  <div class="enroll-icon" [ngClass]="'enroll-icon--' + item.enrollment.status">
                    <mat-icon>{{ item.enrollment.status === 'enrolled' ? 'check_circle' : 'cancel' }}</mat-icon>
                  </div>
                  <div class="enroll-info">
                    <strong>{{ item.studentName }}</strong>
                    <span>{{ item.courseName }}</span>
                    <span class="enroll-date">{{ item.enrollment.enrollmentDate | date:'MMM d, y' }}</span>
                  </div>
                  <span class="enroll-status" [ngClass]="'status-' + item.enrollment.status">
                    {{ item.enrollment.status }}
                  </span>
                </div>
                <div class="empty-state" *ngIf="recentEnrollments.length === 0">
                  <mat-icon>inbox</mat-icon>
                  <p>No enrollments yet</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
    .page-header { margin-bottom: 28px; }
    .page-header h1 { display: flex; align-items: center; gap: 10px; font-size: 1.8rem; font-weight: 700; margin: 0 0 6px; }
    .page-header p { color: #64748b; margin: 0; }
    .enrollment-layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
    .enroll-card, .history-card { border-radius: 12px !important; }
    mat-card-title { display: flex; align-items: center; gap: 8px; }
    .step-form { padding: 16px 0; }
    .full-width { width: 100%; }
    .option-content { display: flex; flex-direction: column; gap: 2px; }
    .option-main { font-weight: 600; font-size: 0.9rem; }
    .option-sub { font-size: 0.75rem; color: #64748b; }
    .mat-select-search {
      width: 100%; border: none; outline: none; padding: 8px 12px;
      font-size: 0.9rem; border-bottom: 1px solid #e5e7eb;
    }

    .selected-preview {
      display: flex; align-items: center; gap: 12px;
      background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;
      padding: 12px; margin: 8px 0 16px;
    }
    .preview-avatar {
      width: 42px; height: 42px; border-radius: 50%; background: #6366f1; color: white;
      display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;
    }
    .preview-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .preview-info strong { font-size: 0.95rem; }
    .preview-info span { font-size: 0.8rem; color: #475569; }
    .preview-stat { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: #64748b; }
    .preview-stat mat-icon { font-size: 16px; height: 16px; width: 16px; }

    .course-preview {
      background: #fafafa; border: 1px solid #e5e7eb; border-radius: 10px;
      padding: 16px; margin: 8px 0 16px;
    }
    .course-preview-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .code { background: #ede9fe; color: #5b21b6; padding: 3px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; }
    .course-preview h3 { margin: 0 0 8px; font-size: 1rem; }
    .course-preview p { font-size: 0.85rem; color: #64748b; margin: 0 0 12px; }
    .course-preview-stats { display: flex; gap: 16px; font-size: 0.82rem; color: #475569; margin-bottom: 12px; }
    .course-preview-stats span { display: flex; align-items: center; gap: 4px; }
    .course-preview-stats mat-icon { font-size: 15px; height: 15px; width: 15px; }
    .seats-bar span { font-size: 0.82rem; color: #64748b; display: block; margin-bottom: 6px; }
    .status-badge { padding: 3px 10px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
    .status-open { background: #d1fae5; color: #065f46; }
    .status-closed { background: #fee2e2; color: #991b1b; }
    .status-waitlist { background: #fef3c7; color: #92400e; }

    .confirm-step { padding: 16px 0; }
    .confirm-section { background: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
    .confirm-section h4 { margin: 0 0 16px; font-size: 1rem; color: #374151; font-weight: 700; }
    .summary-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 0.9rem; }
    .summary-row:last-child { border-bottom: none; }
    .summary-label { color: #64748b; font-weight: 500; }
    .fee-amount { font-weight: 700; color: #059669; font-size: 1rem; }

    .step-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 8px; }

    /* History */
    .history-card mat-card-title { font-size: 0.95rem !important; }
    .enrollment-list { display: flex; flex-direction: column; max-height: 600px; overflow-y: auto; }
    .enrollment-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .enrollment-item:last-child { border-bottom: none; }
    .enroll-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .enroll-icon mat-icon { font-size: 20px; height: 20px; width: 20px; }
    .enroll-icon--enrolled { background: #d1fae5; color: #10b981; }
    .enroll-icon--dropped { background: #fee2e2; color: #ef4444; }
    .enroll-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .enroll-info strong { font-size: 0.85rem; }
    .enroll-info span { font-size: 0.75rem; color: #64748b; }
    .enroll-date { color: #94a3b8 !important; }
    .enroll-status { padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: 600; text-transform: capitalize; white-space: nowrap; }
    .status-enrolled { background: #d1fae5; color: #065f46; }
    .status-dropped { background: #fee2e2; color: #991b1b; }
    .empty-state { text-align: center; padding: 40px; color: #94a3b8; }
    .empty-state mat-icon { font-size: 32px; height: 32px; width: 32px; }
    @media (max-width: 768px) { .enrollment-layout { grid-template-columns: 1fr; } }
  `]
})
export class EnrollStudentComponent implements OnInit {
  step1Form!: FormGroup;
  step2Form!: FormGroup;
  students: Student[] = [];
  filteredStudents: Student[] = [];
  courses: Course[] = [];
  enrollments: Enrollment[] = [];
  recentEnrollments: Array<{ enrollment: Enrollment; studentName: string; courseName: string }> = [];
  isSubmitting = false;

  get selectedStudent(): Student | undefined {
    const id = this.step1Form?.get('studentId')?.value;
    return id ? this.students.find(s => s.id === id) : undefined;
  }

  get selectedCourse(): Course | undefined {
    const id = this.step2Form?.get('courseId')?.value;
    return id ? this.courses.find(c => c.id === id) : undefined;
  }

  get availableCourses(): Course[] {
    return this.courses;
  }

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.step1Form = this.fb.group({ studentId: [null, Validators.required] });
    this.step2Form = this.fb.group({
      courseId: [null, Validators.required],
      notes: ['']
    });

    combineLatest([
      this.studentService.getStudents(),
      this.courseService.getCourses(),
      this.enrollmentService.getEnrollments()
    ]).subscribe(([students, courses, enrollments]) => {
      this.students = students;
      this.filteredStudents = students;
      this.courses = courses;
      this.enrollments = enrollments;
      this.buildRecentEnrollments(enrollments, students, courses);
    });
  }

  buildRecentEnrollments(enrollments: Enrollment[], students: Student[], courses: Course[]): void {
    this.recentEnrollments = enrollments
      .slice(-10)
      .reverse()
      .map(enrollment => {
        const student = students.find(s => s.id === enrollment.studentId);
        const course = courses.find(c => c.id === enrollment.courseId);
        return {
          enrollment,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
          courseName: course ? `${course.code} – ${course.name}` : 'Unknown'
        };
      });
  }

  filterStudents(event: Event): void {
    const text = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredStudents = this.students.filter(s =>
      `${s.firstName} ${s.lastName} ${s.email} ${s.department}`.toLowerCase().includes(text)
    );
  }

  getStudentInitials(student: Student): string {
    return `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
  }

  isAlreadyEnrolled(courseId: number): boolean {
    const studentId = this.step1Form.get('studentId')?.value;
    if (!studentId) return false;
    return this.enrollments.some(
      e => e.studentId === studentId && e.courseId === courseId && e.status === 'enrolled'
    );
  }

  submitEnrollment(): void {
    const studentId = this.step1Form.get('studentId')?.value;
    const courseId = this.step2Form.get('courseId')?.value;
    const notes = this.step2Form.get('notes')?.value;

    if (!studentId || !courseId) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Enrollment',
        message: `Enroll ${this.selectedStudent?.firstName} in ${this.selectedCourse?.name}?`,
        confirmText: 'Enroll Now',
        type: 'info'
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.isSubmitting = true;
      this.enrollmentService.enrollStudent(studentId, courseId, notes).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.snackBar.open(
            `✅ ${this.selectedStudent?.firstName} successfully enrolled in ${this.selectedCourse?.name}!`,
            'Close',
            { duration: 4000, panelClass: ['success-snackbar'] }
          );
          this.step1Form.reset();
          this.step2Form.reset();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.snackBar.open(`❌ ${err.message}`, 'Close', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
        }
      });
    });
  }
}
