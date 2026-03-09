import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface AuthUser {
  username: string;
  role: 'admin' | 'student';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Demo credentials
  private readonly DEMO_USERS = [
    { username: 'admin', password: 'admin123', role: 'admin' as const },
    { username: 'student', password: 'student123', role: 'student' as const }
  ];

  constructor() {
    // Restore session
    const saved = sessionStorage.getItem('auth_user');
    if (saved) {
      this.currentUserSubject.next(JSON.parse(saved));
    }
  }

  login(username: string, password: string): Observable<{ success: boolean; message: string }> {
    const user = this.DEMO_USERS.find(
      u => u.username === username && u.password === password
    );
    if (user) {
      const authUser: AuthUser = { username: user.username, role: user.role };
      this.currentUserSubject.next(authUser);
      sessionStorage.setItem('auth_user', JSON.stringify(authUser));
      return of({ success: true, message: 'Login successful' }).pipe(delay(500));
    }
    return of({ success: false, message: 'Invalid username or password' }).pipe(delay(500));
  }

  logout(): void {
    this.currentUserSubject.next(null);
    sessionStorage.removeItem('auth_user');
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.getValue() !== null;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.getValue();
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin';
  }
}
