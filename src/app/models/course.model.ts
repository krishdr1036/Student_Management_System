// Course Model
export interface Course {
  id: number;
  code: string;
  name: string;
  description: string;
  department: string;
  credits: number;
  instructor: string;
  schedule: string;
  totalSeats: number;
  enrolledCount: number;
  fee: number;
  status: 'open' | 'closed' | 'waitlist';
  startDate: string;
  endDate: string;
}

export class CourseModel implements Course {
  id: number;
  code: string;
  name: string;
  description: string;
  department: string;
  credits: number;
  instructor: string;
  schedule: string;
  totalSeats: number;
  enrolledCount: number;
  fee: number;
  status: 'open' | 'closed' | 'waitlist';
  startDate: string;
  endDate: string;

  constructor(data: Partial<Course> = {}) {
    this.id = data.id ?? 0;
    this.code = data.code ?? '';
    this.name = data.name ?? '';
    this.description = data.description ?? '';
    this.department = data.department ?? '';
    this.credits = data.credits ?? 3;
    this.instructor = data.instructor ?? '';
    this.schedule = data.schedule ?? '';
    this.totalSeats = data.totalSeats ?? 30;
    this.enrolledCount = data.enrolledCount ?? 0;
    this.fee = data.fee ?? 0;
    this.status = data.status ?? 'open';
    this.startDate = data.startDate ?? '';
    this.endDate = data.endDate ?? '';
  }

  get availableSeats(): number {
    return this.totalSeats - this.enrolledCount;
  }

  get isLimitedSeats(): boolean {
    return this.availableSeats <= 5 && this.availableSeats > 0;
  }

  get isFull(): boolean {
    return this.availableSeats <= 0;
  }

  get occupancyPercentage(): number {
    return Math.round((this.enrolledCount / this.totalSeats) * 100);
  }
}
