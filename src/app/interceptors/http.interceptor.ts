import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export const httpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const snackBar = inject(MatSnackBar);

  // Clone and add headers
  const modifiedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'X-App-Version': '1.0.0'
    }
  });

  return next(modifiedReq).pipe(
    tap(() => {
      // Successful response - could log here
    }),
    catchError(error => {
      let message = 'An error occurred';
      if (error.status === 404) {
        message = 'Resource not found';
      } else if (error.status === 500) {
        message = 'Server error. Please try again.';
      } else if (error.status === 0) {
        message = 'Network error. Please check your connection.';
      }
      snackBar.open(message, 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return throwError(() => error);
    })
  );
};
