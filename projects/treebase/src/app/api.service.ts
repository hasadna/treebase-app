import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, from, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  cache: any = {};

  constructor(private http: HttpClient) {
  }

  query(sql: string) {
    if (this.cache[sql]) {
      return from([this.cache[sql]]);
    }
    const sqlParam = encodeURIComponent(btoa(decodeURIComponent(encodeURIComponent(sql))));
    const url = `https://api.digital-forest.org.il/api/query?query=${sqlParam}&num_rows=100`;
    return this.http.get(url)
      .pipe(
        catchError((err) => {
          alert('שגיאה בשליפת המידע');          
          return from([{}]);
        }),
        map((response: any) => response.rows || []),
        tap((rows) => { this.cache[sql] = rows; })
      );
  }
    
}
