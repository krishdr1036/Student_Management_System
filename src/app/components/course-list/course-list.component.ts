import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { Course } from '../../models/course.model';
import { CourseService } from '../../services/course.service';
import { HighlightDirective } from '../../directives/highlight.directive';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule,
    MatProgressBarModule, MatTooltipModule, MatBadgeModule,
    HighlightDirective
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1><mat-icon>menu_book</mat-icon> Course Catalog</h1>
          <p>Browse all available courses and check seat availability</p>
        </div>
        <div class="view-toggle">
          <button mat-icon-button [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'">
            <mat-icon>grid_view</mat-icon>
          </button>
          <button mat-icon-button [class.active]="viewMode === 'list'" (click)="viewMode = 'list'">
            <mat-icon>view_list</mat-icon>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search courses...</mat-label>
          <input matInput [(ngModel)]="searchText" placeholder="Name, code, instructor...">
          <mat-icon matPrefix>search</mat-icon>
          <button mat-icon-button matSuffix *ngIf="searchText" (click)="searchText = ''">
            <mat-icon>close</mat-icon>
          </button>
        </mat-form-field>

        <mat-form-field appearance="outline" class="dept-field">
          <mat-label>Department</mat-label>
          <mat-select [(ngModel)]="selectedDept">
            <mat-option value="">All Departments</mat-option>
            <mat-option *ngFor="let dept of departments" [value]="dept">{{ dept }}</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="status-chips">
          <mat-chip-set>
            <mat-chip *ngFor="let s of statusOptions"
              [class.active-chip]="selectedStatus === s.value"
              (click)="selectedStatus = s.value">
              <mat-icon>{{ s.icon }}</mat-icon> {{ s.label }}
            </mat-chip>
          </mat-chip-set>
        </div>

        <span class="count-badge">{{ filteredCourses.length }} courses</span>
      </div>

      <!-- Grid View -->
      <div class="courses-grid" *ngIf="viewMode === 'grid'">
        <mat-card class="course-card"
          *ngFor="let course of filteredCourses"
          [appHighlight]="course.status"
          [availableSeats]="course.totalSeats - course.enrolledCount">

          <div class="course-card-header">
            <div class="course-code-badge">{{ course.code }}</div>
            <span class="status-dot" [ngClass]="'dot-' + course.status"
                  [matTooltip]="course.status | titlecase"></span>
          </div>

          <mat-card-content>
            <h3 class="course-title">{{ course.name }}</h3>
            <p class="course-desc">{{ course.description }}</p>

            <div class="course-meta-row">
              <span class="meta-item"><mat-icon>person</mat-icon> {{ course.instructor }}</span>
              <span class="meta-item"><mat-icon>schedule</mat-icon> {{ course.schedule }}</span>
            </div>

            <div class="seats-section">
              <div class="seats-header">
                <span>Seats</span>
                <span [ngClass]="getSeatClass(course)">
                  {{ course.totalSeats - course.enrolledCount }} / {{ course.totalSeats }} available
                </span>
              </div>
              <mat-progress-bar
                [value]="(course.enrolledCount / course.totalSeats) * 100"
                [color]="getProgressColor(course)">
              </mat-progress-bar>
            </div>

            <div class="course-footer">
              <div class="course-stats">
                <span class="stat"><mat-icon>star</mat-icon> {{ course.credits }} Credits</span>
                <span class="stat"><mat-icon>attach_money</mat-icon> {{ course.fee | currency }}</span>
              </div>
              <span class="status-badge" [ngClass]="'status-' + course.status">
                {{ course.status }}
              </span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- List View -->
      <mat-card class="list-view" *ngIf="viewMode === 'list'">
        <div class="list-item" *ngFor="let course of filteredCourses"
          [appHighlight]="course.status"
          [availableSeats]="course.totalSeats - course.enrolledCount">

          <div class="list-left">
            <div class="course-code-sm">{{ course.code }}</div>
            <div>
              <h3>{{ course.name }}</h3>
              <p>{{ course.instructor }} • {{ course.schedule }}</p>
            </div>
          </div>

          <div class="list-right">
            <span class="dept-badge">{{ course.department }}</span>
            <span>{{ course.credits }} cr</span>
            <span [ngClass]="getSeatClass(course)">
              {{ course.totalSeats - course.enrolledCount }} seats left
            </span>
            <span class="status-badge" [ngClass]="'status-' + course.status">{{ course.status }}</span>
            <span class="fee">{{ course.fee | currency }}</span>
          </div>
        </div>
        <div class="empty-state" *ngIf="filteredCourses.length === 0">
          <mat-icon>search_off</mat-icon>
          <p>No courses match your search criteria</p>
        </div>
      </mat-card>

      <div class="empty-page" *ngIf="filteredCourses.length === 0 && viewMode === 'grid'">
        <mat-icon>library_books</mat-icon>
        <p>No courses found. Try adjusting your filters.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { display: flex; align-items: center; gap: 10px; font-size: 1.8rem; font-weight: 700; margin: 0 0 6px; }
    .page-header p { color: #64748b; margin: 0; }
    .view-toggle { display: flex; gap: 4px; }
    .view-toggle .active { background: #ede9fe; color: #6366f1; }
    .filters-bar { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
    .search-field { flex: 1; min-width: 250px; }
    .dept-field { min-width: 200px; }
    .status-chips { display: flex; align-items: center; }
    .active-chip { background: #6366f1 !important; color: white !important; }
    .count-badge { background: #f1f5f9; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; color: #64748b; }

    .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .course-card { border-radius: 14px !important; transition: all 0.2s; cursor: pointer; }
    .course-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important; }

    /* Highlight directive styles */
    :host ::ng-deep .highlight-limited { border-left: 4px solid #f59e0b !important; }
    :host ::ng-deep .highlight-full { border-left: 4px solid #ef4444 !important; opacity: 0.85; }
    :host ::ng-deep .highlight-waitlist { border-left: 4px solid #8b5cf6 !important; }
    :host ::ng-deep .highlight-open { border-left: 4px solid #10b981 !important; }

    .course-card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 16px 0; }
    .course-code-badge { background: #ede9fe; color: #5b21b6; padding: 4px 12px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot-open { background: #10b981; }
    .dot-closed { background: #ef4444; }
    .dot-waitlist { background: #f59e0b; }
    .course-title { font-size: 1rem; font-weight: 700; margin: 12px 0 8px; color: #0f172a; }
    .course-desc { font-size: 0.85rem; color: #64748b; line-height: 1.5; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .course-meta-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .meta-item { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: #475569; }
    .meta-item mat-icon { font-size: 15px; height: 15px; width: 15px; }
    .seats-section { margin-bottom: 16px; }
    .seats-header { display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px; }
    .seats-ok { color: #10b981; font-weight: 600; }
    .seats-limited { color: #f59e0b; font-weight: 600; }
    .seats-full { color: #ef4444; font-weight: 600; }
    .course-footer { display: flex; justify-content: space-between; align-items: center; }
    .course-stats { display: flex; gap: 12px; }
    .stat { display: flex; align-items: center; gap: 4px; font-size: 0.82rem; color: #475569; font-weight: 500; }
    .stat mat-icon { font-size: 14px; height: 14px; width: 14px; }
    .status-badge { padding: 3px 10px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
    .status-open { background: #d1fae5; color: #065f46; }
    .status-closed { background: #fee2e2; color: #991b1b; }
    .status-waitlist { background: #fef3c7; color: #92400e; }

    .list-view { border-radius: 12px !important; overflow: hidden; }
    .list-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-bottom: 1px solid #f1f5f9; transition: background 0.15s;
    }
    .list-item:hover { background: #f8fafc; }
    .list-item:last-child { border-bottom: none; }
    .list-left { display: flex; align-items: center; gap: 16px; }
    .course-code-sm { background: #ede9fe; color: #5b21b6; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; white-space: nowrap; }
    .list-left h3 { font-size: 0.95rem; font-weight: 600; margin: 0 0 4px; color: #0f172a; }
    .list-left p { font-size: 0.8rem; color: #64748b; margin: 0; }
    .list-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .dept-badge { background: #dbeafe; color: #1d4ed8; padding: 3px 10px; border-radius: 10px; font-size: 0.75rem; font-weight: 500; }
    .fee { font-weight: 700; color: #0f172a; }
    .empty-state, .empty-page { text-align: center; padding: 60px; color: #94a3b8; }
    .empty-state mat-icon, .empty-page mat-icon { font-size: 48px; height: 48px; width: 48px; }
    @media (max-width: 600px) { .courses-grid { grid-template-columns: 1fr; } }
  `]
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  searchText = '';
  selectedDept = '';
  selectedStatus = '';
  viewMode: 'grid' | 'list' = 'grid';
  departments: string[] = [];

  statusOptions = [
    { label: 'All', value: '', icon: 'all_inclusive' },
    { label: 'Open', value: 'open', icon: 'check_circle' },
    { label: 'Waitlist', value: 'waitlist', icon: 'hourglass_empty' },
    { label: 'Closed', value: 'closed', icon: 'block' }
  ];

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.courseService.getCourses().subscribe(courses => {
      this.courses = courses;
      this.departments = [...new Set(courses.map(c => c.department))].sort();
    });
  }

  get filteredCourses(): Course[] {
    return this.courses.filter(c => {
      const textMatch = !this.searchText || 
        `${c.name} ${c.code} ${c.instructor} ${c.department}`.toLowerCase().includes(this.searchText.toLowerCase());
      const deptMatch = !this.selectedDept || c.department === this.selectedDept;
      const statusMatch = !this.selectedStatus || c.status === this.selectedStatus;
      return textMatch && deptMatch && statusMatch;
    });
  }

  getSeatClass(course: Course): string {
    const avail = course.totalSeats - course.enrolledCount;
    if (avail <= 0) return 'seats-full';
    if (avail <= 5) return 'seats-limited';
    return 'seats-ok';
  }

  getProgressColor(course: Course): string {
    const pct = (course.enrolledCount / course.totalSeats) * 100;
    if (pct >= 100) return 'warn';
    if (pct >= 80) return 'accent';
    return 'primary';
  }
}
