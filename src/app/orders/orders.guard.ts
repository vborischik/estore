import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const ordersGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.hasRole('admin'); // Разрешено только для admin
};
