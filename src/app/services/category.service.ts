import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';

export interface Category {
  categoryID: number;
  categoryName: string;
  description?: string;
}

export interface CategoryResponse {
  totalCount: number;
  categories: Category[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getCategories(pageNumber: number = 1, pageSize: number = 10): Observable<CategoryResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<CategoryResponse>(this.apiUrl, { params });
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  addCategory(category: Omit<Category, 'categoryID'>): Observable<any> {
    return this.http.post<any>(this.apiUrl, category);
  }

  updateCategory(updatedCategory: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${updatedCategory.categoryID}`, updatedCategory);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}