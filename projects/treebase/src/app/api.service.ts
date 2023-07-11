import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, from, map, tap } from 'rxjs';


export class SearchResult {
  constructor(public term: string, public prefix: string, public display: string) {}

  public click(router: Router) {}

  public render() {
    return `<span class="prefix">${this.prefix}</span>&nbsp;<span class='result'>${this.display.replace(this.term, '<em>' + this.term + '</em>')}</span>`;
  }
}

export class URLSearchResult extends SearchResult {
  private url: string[];
  private params: any = {};

  constructor(row: any, url: string[], params: any={}) {
    super(row.term, row.prefix, row.display);
    this.url = url;
    this.params = params;
  }

  override click(router: Router) {
    router.navigate(this.url, this.params);
  }
}

export class MuniSearchResult extends URLSearchResult {
  constructor(row: any) {
    super(row, ['munis', row.code]);
  }
}

export class StatAreaSearchResult extends URLSearchResult {
  constructor(row: any) {
    super(row, ['stat-areas', row.code]);
  }
}

export class FocusSearchResult extends URLSearchResult {
  constructor(row: any, queryParams: any={}) {
    super(row, ['trees'], {
      queryParams: Object.assign({focus: `${row.kind}:${row.code}`}, queryParams),
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}

export class ParcelSearchResult extends FocusSearchResult {
  constructor(row: any) {
    super(row, {cadaster: '1'});
  }
}

export class SearchConfig {
  constructor(public kind: string, public table: string, public field: string, public code: string, public prefix: string) {
  }
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  cache: any = {};
  SEARCH_CONFIG = [
    new SearchConfig('muni', 'munis', 'muni_name', 'muni_code', 'רשות מקומית:'),
    new SearchConfig('stat-area', 'stat_areas', 'code', 'code', 'אזור סטטיסטי:'),
    new SearchConfig('parcel', 'parcels', 'code', 'code', 'גוש/חלקה:'),
    new SearchConfig('roads', 'roads', 'road_id', 'road_id', 'רחוב:'),
  ];

  constructor(private http: HttpClient) {
  }

  b64EncodeUnicode(str: string) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16))
    }));
}

  query(sql: string, cacheKey: string|null=null) {
    if (!cacheKey) {
      cacheKey = sql;
    }
    if (this.cache[cacheKey]) {
      return from([this.cache[cacheKey]]);
    }
    const sqlParam = encodeURIComponent(this.b64EncodeUnicode(sql));
    const url = `https://api.digital-forest.org.il/api/query?query=${sqlParam}&num_rows=1000`;
    return this.http.get(url)
      .pipe(
        catchError((err) => {
          alert('שגיאה בשליפת המידע');          
          return from([{}]);
        }),
        map((response: any) => response.rows || []),
        tap((rows) => { this.cache[cacheKey || sql] = rows; })
      );
  }

  search(term: string): Observable<SearchResult[]> {
    const queries = [];
    for (const config of this.SEARCH_CONFIG) {
      let query = `(SELECT
          '${config.kind}' AS kind,
          '${config.prefix}' AS prefix,
          '${term}' AS term,
          ${config.code} AS code,
          ${config.field} AS display
        FROM ${config.table}
        WHERE ${config.field} LIKE '${term}%%' LIMIT 10)`;
      query = query.split(/\s+/g).join(' ');
      queries.push(query);
    }
    return this.query(queries.join(' UNION ALL '), 'search:' + term).pipe(
      map((rows: any[]) => {
        const buckets: any = {};
        const kinds: string[] = [];
        let count = 0;
        rows.forEach((row) => {
          if (!buckets[row.kind]) {
            buckets[row.kind] = [];
          }
          buckets[row.kind].push(row);
          count += 1;
          if (kinds.indexOf(row.kind) === -1) {
            kinds.push(row.kind);
          }
        });
        let kindIdx = kinds.length - 1;
        while (count > 10) {
          const kind = kinds[kindIdx];
          if (buckets[kind] && buckets[kind].length > 0) {
            buckets[kind].pop();
          }
          count -= 1;
          kindIdx = (kindIdx + kinds.length - 1) % kinds.length;
        }
        const results: any[] = [];
        kinds.forEach((kind) => {
          results.push(...buckets[kind]);
        });
        return results.map((row) => {
          if (row.kind === 'muni') {
            return new MuniSearchResult(row);
          } else if (row.kind === 'parcel') {
            return new ParcelSearchResult(row);
          } else if (row.kind === 'roads') {
            return new FocusSearchResult(row);
          } else if (row.kind === 'stat-area') {
            return new StatAreaSearchResult(row);
          }
          return new SearchResult('', '', '');
        }).filter((row) => row.term !== '');
      }),
    );
  }
}
