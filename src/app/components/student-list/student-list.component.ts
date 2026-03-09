import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatDialogModule, MatSnackBarModule,
    MatSelectModule, MatTooltipModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1><mat-icon>people</mat-icon> Students</h1>
          <p>Manage registered students and their enrollments</p>
        </div>
        <button mat-raised-button color="primary" (click)="toggleAddForm()">
          <mat-icon>{{ showAddForm ? 'close' : 'person_add' }}</mat-icon>
          {{ showAddForm ? 'Cancel' : 'Add Student' }}
        </button>
      </div>

      <!-- Add Student Form -->
      <mat-card class="add-form-card" *ngIf="showAddForm">
        <mat-card-header>
          <mat-card-title>Add New Student</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="addStudentForm" (ngSubmit)="onAddStudent()" class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName">
              <mat-error *ngIf="addStudentForm.get('firstName')?.hasError('required')">Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName">
              <mat-error *ngIf="addStudentForm.get('lastName')?.hasError('required')">Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email">
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="addStudentForm.get('email')?.hasError('required')">Required</mat-error>
              <mat-error *ngIf="addStudentForm.get('email')?.hasError('email')">Invalid email format</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone">
              <mat-icon matPrefix>phone</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Department</mat-label>
              <mat-select formControlName="department">
                <mat-option *ngFor="let dept of departments" [value]="dept">{{ dept }}</mat-option>
              </mat-select>
              <mat-error *ngIf="addStudentForm.get('department')?.hasError('required')">Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="active">Active</mat-option>
                <mat-option value="inactive">Inactive</mat-option>
                <mat-option value="graduated">Graduated</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="toggleAddForm()">Cancel</button>
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="addStudentForm.invalid">
                <mat-icon>save</mat-icon> Save Student
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Search & Filters -->
      <mat-card class="filter-card">
        <div class="filter-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search students...</mat-label>
            <input matInput (keyup)="applyFilter($event)" #filterInput>
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
          <div class="filter-chips">
            <span class="filter-label">Filter:</span>
            <mat-chip-set>
              <mat-chip *ngFor="let status of statusFilters"
                [class.active-chip]="activeStatusFilter === status.value"
                (click)="filterByStatus(status.value)">
                {{ status.label }}
              </mat-chip>
            </mat-chip-set>
          </div>
          <span class="count-badge">{{ dataSource.filteredData.length }} students</span>
        </div>
      </mat-card>

      <!-- Table -->
      <mat-card class="table-card">
        <div class="table-wrapper">
          <table mat-table [dataSource]="dataSource" matSort class="students-table">

            <ng-container matColumnDef="avatar">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let student">
                <div class="avatar" [ngClass]="'avatar--' + student.status">
                  {{ getInitials(student) }}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
              <td mat-cell *matCellDef="let student">
                <div class="student-name">{{ student.firstName }} {{ student.lastName }}</div>
                <div class="student-email">{{ student.email }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
              <td mat-cell *matCellDef="let student">
                <span class="dept-badge">{{ student.department }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="enrolledCourses">
              <th mat-header-cell *matHeaderCellDef>Courses</th>
              <td mat-cell *matCellDef="let student">
                <span class="course-count">{{ student.enrolledCourses.length }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="enrollmentDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Enrolled</th>
              <td mat-cell *matCellDef="let student">{{ student.enrollmentDate | date:'MMM d, y' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let student">
                <span class="status-badge" [ngClass]="'status-' + student.status">
                  {{ student.status }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let student">
                <button mat-icon-button [routerLink]="['/students', student.id]"
                        matTooltip="View Details" color="primary">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteStudent(student)"
                        matTooltip="Delete" color="warn">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                <mat-icon>search_off</mat-icon>
                No students found matching your criteria
              </td>
            </tr>
          </table>
        </div>
        <mat-paginator [pageSizeOptions]="[5, 10, 25]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 28px;
    }
    .page-header h1 {
      display: flex; align-items: center; gap: 10px;
      font-size: 1.8rem; font-weight: 700; margin: 0 0 6px; color: #0f172a;
    }
    .page-header p { color: #64748b; margin: 0; }
    .add-form-card { margin-bottom: 20px; border-radius: 12px !important; }
    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 8px 0;
    }
    .form-grid mat-form-field { width: 100%; }
    .form-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 12px; }
    .filter-card { margin-bottom: 16px; border-radius: 12px !important; padding: 4px 0; }
    .filter-row {
      display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
      padding: 8px 16px;
    }
    .search-field { flex: 1; min-width: 250px; }
    .filter-chips { display: flex; align-items: center; gap: 8px; }
    .filter-label { font-size: 0.85rem; font-weight: 600; color: #64748b; }
    .active-chip { background: #6366f1 !important; color: white !important; }
    .count-badge {
      background: #f1f5f9; padding: 4px 12px; border-radius: 20px;
      font-size: 0.8rem; font-weight: 600; color: #64748b; white-space: nowrap;
    }
    .table-card { border-radius: 12px !important; overflow: hidden; }
    .table-wrapper { overflow-x: auto; }
    .students-table { width: 100%; }
    .avatar {
      width: 38px; height: 38px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;
    }
    .avatar--active { background: #d1fae5; color: #065f46; }
    .avatar--inactive { background: #fef3c7; color: #92400e; }
    .avatar--graduated { background: #dbeafe; color: #1e40af; }
    .student-name { font-weight: 600; color: #0f172a; }
    .student-email { font-size: 0.8rem; color: #64748b; }
    .dept-badge {
      background: #ede9fe; color: #5b21b6; padding: 3px 10px;
      border-radius: 12px; font-size: 0.8rem; font-weight: 500;
    }
    .course-count {
      background: #dbeafe; color: #1d4ed8; padding: 2px 10px;
      border-radius: 12px; font-weight: 700; font-size: 0.9rem;
    }
    .status-badge {
      padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; text-transform: capitalize;
    }
    .status-active { background: #d1fae5; color: #065f46; }
    .status-inactive { background: #fef3c7; color: #92400e; }
    .status-graduated { background: #dbeafe; color: #1e40af; }
    .table-row:hover { background: #f8fafc; }
    .no-data { text-align: center; padding: 40px !important; color: #94a3b8; }
    .no-data mat-icon { display: block; font-size: 40px; height: 40px; width: 40px; margin: 0 auto 8px; }
  `]
})
export class StudentListComponent implements OnInit, AfterViewInit {
  displayedColumns = ['avatar', 'name', 'department', 'enrolledCourses', 'enrollmentDate', 'status', 'actions'];
  dataSource = new MatTableDataSource<Student>([]);
  showAddForm = false;
  addStudentForm!: FormGroup;
  activeStatusFilter = 'all';
  departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering'];

  statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Graduated', value: 'graduated' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private studentService: StudentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.studentService.getStudents().subscribe(students => {
      this.dataSource.data = students;
      this.applyStatusFilter();
    });
    this.dataSource.filterPredicate = (data: Student, filter: string) => {
      const f = JSON.parse(filter);
      const textMatch = !f.text || 
        `${data.firstName} ${data.lastName} ${data.email} ${data.department}`.toLowerCase().includes(f.text);
      const statusMatch = !f.status || f.status === 'all' || data.status === f.status;
      return textMatch && statusMatch;
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initForm(): void {
    this.addStudentForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      department: ['', Validators.required],
      status: ['active']
    });
  }

  getInitials(student: Student): string {
    return `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) this.addStudentForm.reset({ status: 'active' });
  }

  onAddStudent(): void {
    if (this.addStudentForm.invalid) return;
    const formValue = this.addStudentForm.value;
    this.studentService.addStudent({
      ...formValue,
      enrollmentDate: new Date().toISOString().split('T')[0],
      enrolledCourses: []
    }).subscribe(() => {
      this.snackBar.open('Student added successfully!', 'Close', { duration: 3000 });
      this.toggleAddForm();
    });
  }

  applyFilter(event: Event): void {
    const text = (event.target as HTMLInputElement).value.toLowerCase();
    this.dataSource.filter = JSON.stringify({ text, status: this.activeStatusFilter });
  }

  filterByStatus(status: string): void {
    this.activeStatusFilter = status;
    this.applyStatusFilter();
  }

  applyStatusFilter(): void {
    const current = this.dataSource.filter ? JSON.parse(this.dataSource.filter) : {};
    this.dataSource.filter = JSON.stringify({ ...current, status: this.activeStatusFilter });
  }

  deleteStudent(student: Student): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Student',
        message: `Are you sure you want to delete ${student.firstName} ${student.lastName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.studentService.deleteStudent(student.id).subscribe(() => {
          this.snackBar.open('Student deleted.', 'Close', { duration: 3000 });
        });
      }
    });
  }
}
