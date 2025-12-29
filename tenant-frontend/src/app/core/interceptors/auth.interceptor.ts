import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    if (token) {
        // Don't set Content-Type for FormData - browser will set it with boundary
        const isFormData = req.body instanceof FormData;

        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        };

        // Only set Content-Type for non-FormData requests
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const clonedRequest = req.clone({
            setHeaders: headers
        });
        return next(clonedRequest);
    }

    return next(req);
};
