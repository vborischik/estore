import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';


interface Customer {
  customerID: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface CustomerResponse {
  totalCount: number;
  customers: Customer[];
}


@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly apiUrl = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl);
  }


  getCustomers(pageNumber: number = 1, pageSize: number = 10): Observable<CustomerResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<CustomerResponse>(this.apiUrl, { params });
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  addCustomer(customer: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, customer);
  }

  updateCustomer(updatedCustomer: Customer): Observable<Customer> {
    const xsrfToken = this.getXsrfToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}) // Добавляем токен, если он есть
    });

    return this.http.put<Customer>(
      `${this.apiUrl}/${updatedCustomer.customerID}`,
      updatedCustomer,
      { headers, withCredentials: true }
    );
  }

  private getXsrfToken(): string | null {
    return document.cookie.split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1] || null;
  }


  deleteCustomer(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
