import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule,provideHttpClient, withXsrfConfiguration } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { routes } from '../src/app/app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { csrfInterceptor } from './app/interceptors/csrf-interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimationsAsync() ,
    importProvidersFrom(HttpClientModule),
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      })
    ),
    importProvidersFrom(RouterModule.forRoot(routes))  // Используй RouterModule.forRoot
  ]
}).catch((err) => console.error(err));
