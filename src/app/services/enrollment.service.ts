import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Enrollment, EnrollmentModel } from '../models/enrollment.model';
import { StudentService } from './student.service';
import { CourseService } from './course.service';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private apiUrl = 'assets/data/enrollments.json';
  private enrollmentsSubject = new BehaviorSubject<Enrollment[]>([]);
  public enrollments$ = this.enrollmentsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private studentService: StudentService,
    private courseService: CourseService
  ) {
    this.loadEnrollments();
  }

  private loadEnrollments(): void {
    this.http.get<{ enrollments: Enrollment[] }>(this.apiUrl).pipe(
      map(res => res.enrollments),
      catchError(() => of([]))
    ).subscribe(enrollments => this.enrollmentsSubject.next(enrollments));
  }

  getEnrollments(): Observable<Enrollment[]> {
    return this.enrollments$;
  }

  getEnrollmentsByStudent(studentId: number): Observable<Enrollment[]> {
    return this.enrollments$.pipe(
      map(enrollments => enrollments.filter(e => e.studentId === studentId))
    );
  }

  getEnrollmentsByCourse(courseId: number): Observable<Enrollment[]> {
    return this.enrollments$.pipe(
      map(enrollments => enrollments.filter(e => e.courseId === courseId))
    );
  }

  enrollStudent(studentId: number, courseId: number, notes?: string): Observable<Enrollment> {
    const current = this.enrollmentsSubject.getValue();
    const existing = current.find(
      e => e.studentId === studentId && e.courseId === courseId && e.status === 'enrolled'
    );
    if (existing) {
      return throwError(() => new Error('Student is already enrolled in this course'));
    }

    return this.courseService.incrementEnrollment(courseId).pipe(
      switchMap(() => this.studentService.enrollStudentInCourse(studentId, courseId)),
      switchMap(() => {
        const newId = current.length > 0 ? Math.max(...current.map(e => e.id)) + 1 : 1;
        const newEnrollment = new EnrollmentModel({
          id: newId,
          studentId,
          courseId,
          enrollmentDate: new Date().toISOString().split('T')[0],
          status: 'enrolled',
          notes
        });
        this.enrollmentsSubject.next([...current, newEnrollment]);
        return of(newEnrollment);
      })
    );
  }

  dropEnrollment(enrollmentId: number): Observable<boolean> {
    const current = this.enrollmentsSubject.getValue();
    const enrollment = current.find(e => e.id === enrollmentId);
    if (!enrollment) return throwError(() => new Error('Enrollment not found'));

    return this.courseService.decrementEnrollment(enrollment.courseId).pipe(
      switchMap(() => this.studentService.dropCourse(enrollment.studentId, enrollment.courseId)),
      switchMap(() => {
        const updated = current.map(e =>
          e.id === enrollmentId ? { ...e, status: 'dropped' as const } : e
        );
        this.enrollmentsSubject.next(updated);
        return of(true);
      })
    );
  }
}
