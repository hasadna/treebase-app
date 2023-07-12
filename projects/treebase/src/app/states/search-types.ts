import { Router } from "@angular/router";
import { FocusMode, MuniFocusMode, ParcelFocusMode, RoadFocusMode, StatAreaFocusMode } from "./focus-modes";

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
  
  export class FocusSearchResult extends URLSearchResult {
    constructor(row: any, focusMode: FocusMode, queryParams: any={}, url=['trees']) {
      super(row, url, {
        queryParams: Object.assign({focus: focusMode.toQueryParam()}, queryParams),
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
  }
  

  export class MuniSearchResult extends FocusSearchResult {
    constructor(row: any) {
      super(row, new MuniFocusMode(row.code, row.display), {}, ['munis', row.code]);
    }
  }
  
  export class StatAreaSearchResult extends FocusSearchResult {
    constructor(row: any) {
      super(row, new StatAreaFocusMode(row.code), {}, ['stat-areas', row.code]);
    }
  }
  
  export class ParcelSearchResult extends FocusSearchResult {
    constructor(row: any) {
      super(row, new ParcelFocusMode(row.code), {cadaster: '1'});
    }
  }

  export class RoadSearchResult extends FocusSearchResult {
    constructor(row: any) {
      super(row, new RoadFocusMode(row.code), {});
    }
  }
  
  export class SearchConfig {
    constructor(public kind: string, public table: string, public field: string, public code: string, public prefix: string) {
    }
  }

  export const SEARCH_CONFIG = [
    new SearchConfig('muni', 'munis', 'muni_name', 'muni_code', 'רשות מקומית:'),
    new SearchConfig('stat-area', 'stat_areas', 'code', 'code', 'אזור סטטיסטי:'),
    new SearchConfig('parcel', 'parcels', 'code', 'code', 'גוש/חלקה:'),
    new SearchConfig('roads', 'roads', 'road_id', 'road_id', 'רחוב:'),
  ];
