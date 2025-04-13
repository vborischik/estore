import { Injectable } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private namespace = 'https://uladzislau.dev/claims/roles'; // Ваш кастомный namespace

  constructor(private auth0: Auth0Service) {}

  // Проверка роли
  hasRole(role: string): Observable<boolean> {
    return this.auth0.idTokenClaims$.pipe(
      map(claims => {
        const roles: string[] = claims?.[this.namespace] || [];
        return roles.includes(role);
      })
    );
  }

  // Проверка наличия хотя бы одной роли из массива
  hasAnyRole(rolesToCheck: string[]): Observable<boolean> {
    return this.auth0.idTokenClaims$.pipe(
      map(claims => {
        const roles: string[] = claims?.[this.namespace] || [];
        return roles.some(r => roles.includes(r));
      })
    );
  }

  // Получаем пользователя
  getUser$() {
    return this.auth0.user$;
  }

  // Проверка, авторизован ли пользователь
  isAuthenticated$() {
    return this.auth0.isAuthenticated$;
  }

  // Логин
  login() {
    this.auth0.loginWithRedirect();
  }

  // Логаут
  logout() {
    this.auth0.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }
}
