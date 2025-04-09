import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';

export interface Order {
  orderID: number;
  customerID: number;
  customerName: string;
  orderDate: string;
  orderStatus: string;
}

export interface OrderDetail {
  orderDetailID: number;
  orderID: number;
  productID: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderResponse {
  totalCount: number;
  orders: Order[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  readonly apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  // Orders
  getOrders(pageNumber: number = 1, pageSize: number = 10): Observable<OrderResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<OrderResponse>(this.apiUrl, { params });
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  createOrder(order: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  // Adding the missing updateOrder method
  updateOrder(order: Order): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${order.orderID}`, order);
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Order details
  getOrderDetails(orderId: number): Observable<OrderDetail[]> {
    return this.http.get<OrderDetail[]>(`${this.apiUrl}/${orderId}/details`);
  }

  addOrderDetail(orderId: number, detail: Partial<OrderDetail>): Observable<OrderDetail> {
    return this.http.post<OrderDetail>(`${this.apiUrl}/${orderId}/details`, detail);
  }

  updateOrderDetail(detail: OrderDetail): Observable<any> {
    return this.http.put(`${this.apiUrl}/details/${detail.orderDetailID}`, detail);
  }

  deleteOrderDetail(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/details/${id}`);
  }
}