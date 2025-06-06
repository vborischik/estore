// import { Routes } from '@angular/router';
// import { DashboardComponent } from './dashboard/dashboard.component';
// import { CustomersComponent } from './customers/customers.component';
// import { ProductsComponent } from './products/products.component';
// import { OrdersComponent } from './orders/orders.component';

// export const routes: Routes = [
//   { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
//   { path: 'dashboard', component: DashboardComponent },
//   { path: 'customers', component: CustomersComponent },
//   { path: 'products', component: ProductsComponent },
//   { path: 'orders', component: OrdersComponent }
// ];


import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WelcomeComponent } from './welcome/welcome.component'; //
import { authGuardFn } from '@auth0/auth0-angular';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuardFn],
    children: [
      { path: '', component: WelcomeComponent },
      { path: 'customers', loadComponent: () => import('./customers/customers.component').then(m => m.CustomersComponent) },
      { path: 'categories', loadComponent: () => import('./categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'products', loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent) },
      { path: 'orders', loadComponent: () => import('./orders/orders.component').then(m => m.OrdersComponent) }

    ]
  }
];
