import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {

  }

  query(sql: string) {
    const sqlParam = encodeURIComponent(btoa(decodeURIComponent(encodeURIComponent(sql))));
    const url = `https://api.digital-forest.org.il/api/query?query=${sqlParam}&num_rows=100`;
    return this.http.get(url)
      .pipe(
        catchError((err) => {
          alert('שגיאה בשליפת המידע');          
          return from([{}]);
        }),
        map((response: any) => response.rows || []),
      );
  }
    
}
