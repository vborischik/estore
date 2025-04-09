import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAuth0 } from '@auth0/auth0-angular';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './app/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';



bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(HttpClientModule),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideAuth0({
      domain: 'testmyfirstapp.us.auth0.com',
      clientId: 'HqQQHzOBM5n32WGNaE9Lw0DBxWb6h2gX',
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: 'https://api.local.dev', // ⚠️ важно: это должен быть ИДЕНТИФИКАТОР API в Auth0
        scope: 'openid profile email'
      }
    })
  ]
});
