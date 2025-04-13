// src/app/services/menu.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';


@Injectable({ providedIn: 'root' })
export class MenuService {
   private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getMenu(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/menu`);
  }
}
