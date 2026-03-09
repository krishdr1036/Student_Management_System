import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Student, StudentModel } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'assets/data/students.json';
  private studentsSubject = new BehaviorSubject<Student[]>([]);
  public students$ = this.studentsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStudents();
  }

  private loadStudents(): void {
    this.http.get<{ students: Student[] }>(this.apiUrl).pipe(
      map(res => res.students),
      catchError(err => {
        console.error('Error loading students', err);
        return of([]);
      })
    ).subscribe(students => this.studentsSubject.next(students));
  }

  getStudents(): Observable<Student[]> {
    return this.students$;
  }

  getStudentById(id: number): Observable<Student | undefined> {
    return this.students$.pipe(
      map(students => students.find(s => s.id === id))
    );
  }

  addStudent(studentData: Omit<Student, 'id'>): Observable<Student> {
    const current = this.studentsSubject.getValue();
    const newId = current.length > 0 ? Math.max(...current.map(s => s.id)) + 1 : 1;
    const newStudent = new StudentModel({ ...studentData, id: newId });
    const updated = [...current, newStudent];
    this.studentsSubject.next(updated);
    return of(newStudent);
  }

  updateStudent(id: number, changes: Partial<Student>): Observable<Student> {
    const current = this.studentsSubject.getValue();
    const idx = current.findIndex(s => s.id === id);
    if (idx === -1) return throwError(() => new Error('Student not found'));
    const updated = [...current];
    updated[idx] = { ...updated[idx], ...changes };
    this.studentsSubject.next(updated);
    return of(updated[idx]);
  }

  deleteStudent(id: number): Observable<boolean> {
    const current = this.studentsSubject.getValue();
    const updated = current.filter(s => s.id !== id);
    this.studentsSubject.next(updated);
    return of(true);
  }

  enrollStudentInCourse(studentId: number, courseId: number): Observable<Student> {
    const current = this.studentsSubject.getValue();
    const student = current.find(s => s.id === studentId);
    if (!student) return throwError(() => new Error('Student not found'));
    if (student.enrolledCourses.includes(courseId)) {
      return throwError(() => new Error('Student already enrolled in this course'));
    }
    return this.updateStudent(studentId, {
      enrolledCourses: [...student.enrolledCourses, courseId]
    });
  }

  dropCourse(studentId: number, courseId: number): Observable<Student> {
    const current = this.studentsSubject.getValue();
    const student = current.find(s => s.id === studentId);
    if (!student) return throwError(() => new Error('Student not found'));
    return this.updateStudent(studentId, {
      enrolledCourses: student.enrolledCourses.filter(id => id !== courseId)
    });
  }

  getDepartments(): Observable<string[]> {
    return this.students$.pipe(
      map(students => [...new Set(students.map(s => s.department))].sort())
    );
  }
}
