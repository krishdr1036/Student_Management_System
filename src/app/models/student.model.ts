// Student Model
export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated';
  enrolledCourses: number[];
}

export class StudentModel implements Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated';
  enrolledCourses: number[];

  constructor(data: Partial<Student> = {}) {
    this.id = data.id ?? 0;
    this.firstName = data.firstName ?? '';
    this.lastName = data.lastName ?? '';
    this.email = data.email ?? '';
    this.phone = data.phone ?? '';
    this.department = data.department ?? '';
    this.enrollmentDate = data.enrollmentDate ?? new Date().toISOString().split('T')[0];
    this.status = data.status ?? 'active';
    this.enrolledCourses = data.enrolledCourses ?? [];
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get initials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }
}
