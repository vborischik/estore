import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';


interface Customer {
  customerID: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
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

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  addCustomer(customer: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, customer);
  }

  updateCustomer(updatedCustomer: Customer): Observable<Customer> {
    return this.http.put<Customer>(
      `${this.apiUrl}/${updatedCustomer.customerID}`,
      updatedCustomer
    );
  }

  deleteCustomer(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
