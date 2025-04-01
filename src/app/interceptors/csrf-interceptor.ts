import { HttpInterceptorFn } from '@angular/common/http';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const xsrfToken = getCookie('XSRF-TOKEN');

  if (xsrfToken) {
    req = req.clone({
      setHeaders: { 'X-XSRF-TOKEN': xsrfToken }
    });
  }

  return next(req);
};

function getCookie(name: string): string | null {
  const matches = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return matches ? matches[2] : null;
}


