# EduEnroll – Student Course Enrollment & Management System

A full-featured Angular 17 application for managing students, courses, and academic enrollments.

---

## 📋 Table of Contents
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Architecture Overview](#architecture-overview)
- [Components](#components)
- [Services](#services)
- [Routing & Guards](#routing--guards)
- [Forms & Validation](#forms--validation)
- [Custom Pipes & Directives](#custom-pipes--directives)
- [Data Models](#data-models)
- [Demo Credentials](#demo-credentials)

---

## 🛠 Tech Stack

| Tool | Version |
|------|---------|
| Angular | 17.x |
| TypeScript | 5.2.x |
| Angular Material | 17.x |
| RxJS | 7.8.x |
| Node.js | 18+ |

---

## ✅ Features

### Student Management
- View all students in a sortable, paginated Material table
- Add new students via reactive form with full validation
- View detailed student profile with enrolled courses
- Delete students with confirmation dialog
- Filter students by status (Active / Inactive / Graduated) and name

### Course Catalog
- Browse courses in grid or list view
- Filter by department, status, and name search
- Real-time seat availability with progress bars
- Color-coded status indicators (Open / Waitlist / Closed)
- Custom highlight directive marks limited-seat courses

### Enrollment Portal
- 3-step Material Stepper workflow:
  1. Select student (with live search)
  2. Select course (previews details & seat count)
  3. Confirm and submit
- Drop courses from student detail view
- Recent enrollments history panel

### Authentication
- Route guard protecting /students, /courses, /enroll
- Session persistence via sessionStorage
- Demo credentials for admin and student roles
- Redirect to intended page after login

---

## 📁 Project Structure

```
student-enrollment-system/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── navbar/              # Navigation bar
│   │   │   ├── home/                # Dashboard/landing page
│   │   │   ├── login/               # Authentication form
│   │   │   ├── student-list/        # Students table + add form
│   │   │   ├── student-detail/      # Individual student profile
│   │   │   ├── course-list/         # Course catalog (grid/list)
│   │   │   ├── enroll-student/      # Enrollment stepper form
│   │   │   └── confirm-dialog/      # Reusable confirmation dialog
│   │   ├── models/
│   │   │   ├── student.model.ts     # Student interface + class
│   │   │   ├── course.model.ts      # Course interface + class
│   │   │   └── enrollment.model.ts  # Enrollment interface + class
│   │   ├── services/
│   │   │   ├── student.service.ts   # Student CRUD + BehaviorSubject
│   │   │   ├── course.service.ts    # Course CRUD + seat management
│   │   │   ├── enrollment.service.ts# Enrollment logic
│   │   │   └── auth.service.ts      # Authentication + session
│   │   ├── guards/
│   │   │   └── auth.guard.ts        # CanActivate + admin guard
│   │   ├── pipes/
│   │   │   └── filter.pipe.ts       # Custom filter pipe
│   │   ├── directives/
│   │   │   └── highlight.directive.ts # Course status highlight
│   │   ├── interceptors/
│   │   │   └── http.interceptor.ts  # Error handling interceptor
│   │   ├── app.component.ts         # Root component
│   │   ├── app.routes.ts            # Route configuration
│   │   └── app.config.ts            # Application providers
│   ├── assets/
│   │   └── data/
│   │       ├── students.json        # Mock student data
│   │       ├── courses.json         # Mock course data
│   │       └── enrollments.json     # Mock enrollment data
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18 or later: https://nodejs.org
- npm 9 or later (comes with Node.js)

### Steps

```bash
# 1. Navigate to the project directory
cd student-enrollment-system

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
# or
ng serve

# 4. Open in browser
# Navigate to http://localhost:4200
```

### Build for Production

```bash
ng build --configuration production
```

---

## 🏗 Architecture Overview

### Standalone Components (Angular 17)
All components use Angular 17's standalone API — no NgModule required. Each component declares its own imports directly.

### State Management with BehaviorSubject
Each service uses a `BehaviorSubject` as an in-memory store:
```typescript
private studentsSubject = new BehaviorSubject<Student[]>([]);
public students$ = this.studentsSubject.asObservable();
```
Components subscribe to the observable and receive live updates when data changes.

### Data Flow
```
JSON Files (assets/data/)
    ↓ HttpClient
Services (BehaviorSubject)
    ↓ Observable
Components (async subscription)
    ↓ Template binding
UI (Angular Material)
```

### Dependency Injection
All services are `providedIn: 'root'` — singleton instances provided at the application level via Angular's DI container.

---

## 🧩 Components

### NavbarComponent
- Displays navigation links when logged in
- Shows user avatar with role badge
- Logout functionality

### HomeComponent
- Dashboard with live statistics (total students, courses, enrollments)
- Feature cards linking to main routes
- CTA for unauthenticated users

### LoginComponent
- **Reactive Form** with `FormBuilder`
- Validation: required, minLength
- Demo credential quick-fill buttons
- Returns user to originally requested URL after login

### StudentListComponent
- `MatTableDataSource` with `MatPaginator` + `MatSort`
- Custom `filterPredicate` combining text search and status chip filter
- Add student via reactive form (inline toggle)
- Delete with `ConfirmDialogComponent`

### StudentDetailComponent
- Loads student by route param (`/students/:id`)
- Uses `combineLatest` to merge student, enrollment, and course data
- Drop course inline with confirmation dialog

### CourseListComponent
- Grid / list view toggle
- Client-side filtering by search text, department, status
- `HighlightDirective` visually marks limited/full courses
- `MatProgressBar` shows seat occupancy
- Built-in `currency` pipe for course fees

### EnrollStudentComponent
- **3-step `MatStepper`** (linear, with form validation per step)
- Step 1: Student selector with live search filter
- Step 2: Course selector with live preview card
- Step 3: Summary + confirmation dialog before submit
- Recent enrollments panel (last 10 records)

### ConfirmDialogComponent
- Reusable dialog accepting `title`, `message`, `type`, button labels
- Types: `warning`, `danger`, `success`, `info` with appropriate icons

---

## ⚙️ Services

### StudentService
| Method | Description |
|--------|-------------|
| `getStudents()` | Returns observable of all students |
| `getStudentById(id)` | Returns single student observable |
| `addStudent(data)` | Adds student, emits updated list |
| `updateStudent(id, changes)` | Partial update |
| `deleteStudent(id)` | Removes student |
| `enrollStudentInCourse(studentId, courseId)` | Appends course to student |
| `dropCourse(studentId, courseId)` | Removes course from student |

### CourseService
| Method | Description |
|--------|-------------|
| `getCourses()` | Returns observable of all courses |
| `getCourseById(id)` | Single course |
| `incrementEnrollment(courseId)` | +1 enrolled, updates status |
| `decrementEnrollment(courseId)` | -1 enrolled |

### EnrollmentService
Orchestrates both StudentService and CourseService using `switchMap`:
```typescript
enrollStudent(studentId, courseId) {
  return this.courseService.incrementEnrollment(courseId).pipe(
    switchMap(() => this.studentService.enrollStudentInCourse(...)),
    switchMap(() => /* create enrollment record */)
  );
}
```

### AuthService
- Stores user in `sessionStorage` for persistence across page refresh
- Exposes `currentUser$` Observable for reactive UI updates
- `isLoggedIn()` and `isAdmin()` helper methods

---

## 🔒 Routing & Guards

```typescript
// app.routes.ts
{ path: 'students', component: StudentListComponent, canActivate: [authGuard] },
{ path: 'students/:id', component: StudentDetailComponent, canActivate: [authGuard] },
{ path: 'courses', component: CourseListComponent, canActivate: [authGuard] },
{ path: 'enroll', component: EnrollStudentComponent, canActivate: [authGuard] },
```

All routes use **lazy loading** with `loadComponent` for optimal bundle splitting.

The `authGuard` is a functional guard (Angular 14+ style):
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
```

---

## 📝 Forms & Validation

### Reactive Forms (LoginComponent, StudentListComponent, EnrollStudentComponent)
```typescript
this.loginForm = this.fb.group({
  username: ['', [Validators.required, Validators.minLength(3)]],
  password: ['', [Validators.required, Validators.minLength(6)]]
});
```

### Template-Driven Forms
Used in CourseListComponent for search and filter fields (`[(ngModel)]`).

### Validation Messages
```html
<mat-error *ngIf="form.get('email')?.hasError('required')">Required</mat-error>
<mat-error *ngIf="form.get('email')?.hasError('email')">Invalid email</mat-error>
```

---

## 🔧 Custom Pipes & Directives

### FilterPipe (`filter.pipe`)
```typescript
// Usage in template
items | filter: searchText : ['name', 'department']
```
Generic pipe that filters any array by multiple fields.

### HighlightDirective (`highlight.directive`)
```html
<div [appHighlight]="course.status" [availableSeats]="course.totalSeats - course.enrolledCount">
```
Adds CSS classes based on course availability:
- `highlight-open` — Normal (green border)
- `highlight-limited` — ≤5 seats (amber border)
- `highlight-waitlist` — Waitlist (purple border)
- `highlight-full` — No seats (red border, dimmed)

### HTTP Interceptor
Adds request headers and globally catches HTTP errors, displaying Material Snackbar notifications.

---

## 📊 Data Models

### Student
```typescript
interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;           // Validated: email format
  phone: string;
  department: string;
  enrollmentDate: string;  // ISO date string
  status: 'active' | 'inactive' | 'graduated';
  enrolledCourses: number[]; // Array of course IDs
}
```

### Course
```typescript
interface Course {
  id: number;
  code: string;            // e.g., "CS101"
  name: string;
  description: string;
  department: string;
  credits: number;
  instructor: string;
  schedule: string;
  totalSeats: number;
  enrolledCount: number;
  fee: number;             // Formatted with currency pipe
  status: 'open' | 'closed' | 'waitlist';
  startDate: string;
  endDate: string;
}
```

### Enrollment
```typescript
interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  enrollmentDate: string;
  grade?: string;
  status: 'enrolled' | 'dropped' | 'completed' | 'waitlisted';
  notes?: string;
}
```

---

## 🔑 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Student | `student` | `student123` |

---

## 📌 Routes Summary

| URL | Component | Guard |
|-----|-----------|-------|
| `/` | → `/home` | None |
| `/home` | HomeComponent | None |
| `/login` | LoginComponent | None |
| `/students` | StudentListComponent | authGuard |
| `/students/:id` | StudentDetailComponent | authGuard |
| `/courses` | CourseListComponent | authGuard |
| `/enroll` | EnrollStudentComponent | authGuard |

---

## 🧪 Testing

```bash
# Run unit tests
ng test

# Run e2e tests
ng e2e
```

---

*Built with Angular 17, Angular Material, RxJS, and TypeScript.*
