import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';

export interface Category {
  categoryID: number;
  categoryName: string;
  description?: string;
  isRemoveAllowed?: boolean;
}

export interface CategoryResponse {
  totalCount: number;
  categories: Category[];
}

export interface CategoryListItem {
  CategoryID: number;
  CategoryName: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  // Keep this method for backward compatibility if needed
  getAllCategories(): Observable<CategoryListItem[]> {
    return this.http.get<CategoryListItem[]>(this.apiUrl);
  }

  // Add new method that handles pagination and returns proper response format
  getCategories(pageNumber: number = 1, pageSize: number = 10): Observable<CategoryResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<CategoryResponse>(this.apiUrl, { params });
  }


  getCategoryDropdown(): Observable<CategoryListItem[]> {
    return this.http.get<CategoryListItem[]>(`${this.apiUrl}/list`);
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



