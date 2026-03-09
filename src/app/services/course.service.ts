import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Course, CourseModel } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'assets/data/courses.json';
  private coursesSubject = new BehaviorSubject<Course[]>([]);
  public courses$ = this.coursesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCourses();
  }

  private loadCourses(): void {
    this.http.get<{ courses: Course[] }>(this.apiUrl).pipe(
      map(res => res.courses),
      catchError(err => {
        console.error('Error loading courses', err);
        return of([]);
      })
    ).subscribe(courses => this.coursesSubject.next(courses));
  }

  getCourses(): Observable<Course[]> {
    return this.courses$;
  }

  getCourseById(id: number): Observable<Course | undefined> {
    return this.courses$.pipe(
      map(courses => courses.find(c => c.id === id))
    );
  }

  getCoursesByIds(ids: number[]): Observable<Course[]> {
    return this.courses$.pipe(
      map(courses => courses.filter(c => ids.includes(c.id)))
    );
  }

  addCourse(courseData: Omit<Course, 'id'>): Observable<Course> {
    const current = this.coursesSubject.getValue();
    const newId = current.length > 0 ? Math.max(...current.map(c => c.id)) + 1 : 1;
    const newCourse = new CourseModel({ ...courseData, id: newId });
    this.coursesSubject.next([...current, newCourse]);
    return of(newCourse);
  }

  updateCourse(id: number, changes: Partial<Course>): Observable<Course> {
    const current = this.coursesSubject.getValue();
    const idx = current.findIndex(c => c.id === id);
    if (idx === -1) return throwError(() => new Error('Course not found'));
    const updated = [...current];
    updated[idx] = { ...updated[idx], ...changes };
    this.coursesSubject.next(updated);
    return of(updated[idx]);
  }

  incrementEnrollment(courseId: number): Observable<Course> {
    const current = this.coursesSubject.getValue();
    const course = current.find(c => c.id === courseId);
    if (!course) return throwError(() => new Error('Course not found'));
    if (course.enrolledCount >= course.totalSeats) {
      return throwError(() => new Error('Course is full'));
    }
    const newCount = course.enrolledCount + 1;
    const newStatus: Course['status'] =
      newCount >= course.totalSeats ? 'closed' :
      newCount >= course.totalSeats - 3 ? 'waitlist' : 'open';
    return this.updateCourse(courseId, { enrolledCount: newCount, status: newStatus });
  }

  decrementEnrollment(courseId: number): Observable<Course> {
    const current = this.coursesSubject.getValue();
    const course = current.find(c => c.id === courseId);
    if (!course) return throwError(() => new Error('Course not found'));
    const newCount = Math.max(0, course.enrolledCount - 1);
    return this.updateCourse(courseId, { enrolledCount: newCount, status: 'open' });
  }

  getDepartments(): Observable<string[]> {
    return this.courses$.pipe(
      map(courses => [...new Set(courses.map(c => c.department))].sort())
    );
  }
}
