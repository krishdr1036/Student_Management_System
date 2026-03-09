// Enrollment Model
export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  enrollmentDate: string;
  grade?: string;
  status: 'enrolled' | 'dropped' | 'completed' | 'waitlisted';
  notes?: string;
}

export class EnrollmentModel implements Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  enrollmentDate: string;
  grade?: string;
  status: 'enrolled' | 'dropped' | 'completed' | 'waitlisted';
  notes?: string;

  constructor(data: Partial<Enrollment> = {}) {
    this.id = data.id ?? 0;
    this.studentId = data.studentId ?? 0;
    this.courseId = data.courseId ?? 0;
    this.enrollmentDate = data.enrollmentDate ?? new Date().toISOString().split('T')[0];
    this.grade = data.grade;
    this.status = data.status ?? 'enrolled';
    this.notes = data.notes;
  }
}
