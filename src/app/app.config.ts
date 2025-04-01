import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXsrfConfiguration } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    // Single provideHttpClient with XSRF configuration
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN', // This should match what your .NET backend sets
        headerName: 'X-XSRF-TOKEN' // This should match what your .NET backend expects
      })
    )
  ]
};