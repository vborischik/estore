import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { routes } from '../src/app/app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimationsAsync() ,
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(RouterModule.forRoot(routes))  // Используй RouterModule.forRoot
  ]
}).catch((err) => console.error(err));
