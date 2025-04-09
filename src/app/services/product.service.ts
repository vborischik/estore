import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';

export interface Product {
  productID: number;
  productName: string;
  categoryID: number;
  price: number;
  stockQuantity: number;
  imageURL?: string;
  upc: string;
  sku: string;
}

export interface ProductResponse {
  totalCount: number;
  products: Product[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(pageNumber: number = 1, pageSize: number = 10): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  addProduct(product: Product): Observable<any> {
    return this.http.post<any>(this.apiUrl, product);
  }

  updateProduct(product: Product): Observable<Product> {
    const xsrfToken = this.getXsrfToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {})
    });

    return this.http.put<Product>(
      `${this.apiUrl}/${product.productID}`,
      product,
      { headers, withCredentials: true }
    );
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  private getXsrfToken(): string | null {
    return document.cookie.split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1] || null;
  }
}
