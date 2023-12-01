import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ApiService } from './api.service';
import { State, StateMode } from './states/base-state';
import { MuniState } from './states/muni-state';
import { MunisState } from './states/munis-state';
import { StatAreaState } from './states/stat-area-state';
import { StatAreasState } from './states/stat-areas-state';
import { TreeState } from './states/tree-state';
import { TreesState } from './states/trees-state';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  state =  new ReplaySubject<State>();
  loading =  new ReplaySubject<void>();

  public sidebarOpened = true;

  constructor(private api: ApiService, private router: Router) { }

  initFromUrl(segments: any[], queryParams: any) {
    let mode = segments[0] as StateMode;
    const id = segments[1] ? decodeURIComponent(segments[1]) : undefined;
    let state: State | null = null;
    if (!mode) {
      mode = 'about';
    }
    if (mode === 'trees') {
      if (id) {
        state = new TreeState(id, queryParams);
      } else {
        state = new TreesState(queryParams);
      }
    }
    if (mode === 'stat-areas') {
      if (id) {
        state = new StatAreaState(id, queryParams);
      } else {
        state = new StatAreasState(queryParams);
      }
    }
    if (mode === 'munis') {
      if (id) {
        state = new MuniState(id, queryParams);
      } else {
        state = new MunisState(queryParams);
      }
    }
    if (mode === 'linkto') {
      this.processLinkto(id || '', queryParams);
    }
    state = state || new State(mode, id, queryParams);
    this.init(state);
  }
  
  processLinkto(id: string, queryParams: any) {
    const parts = id.split(':');
    if (parts.length > 0) {
      if (parts[0] === 'tree' && parts.length === 3) {
        const muni = parts[1];
        const internalId = parts[2];
        const sql = `SELECT "meta-tree-id" FROM trees_processed WHERE "muni_code" = '${muni}' AND "meta-internal-id" = '${internalId}'`;
        this.api.query(sql).subscribe((data: any[]) => {
          if (data.length > 0) {
            const treeId = data[0]['meta-tree-id'];
            this.router.navigate(['/trees', treeId], { queryParams, replaceUrl: true });
          }
        });
      }
    }
  }

  init(state: State) {
    this.loading.next();
    console.log('LOADING STATE');
    state.process(this.api).subscribe(() => {
      console.log('PROCESSED STATE', state);
      this.state.next(state);
    });
  }

}
