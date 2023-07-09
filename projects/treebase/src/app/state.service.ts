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

@Injectable({
  providedIn: 'root'
})
export class StateService {

  state =  new ReplaySubject<State>();

  constructor(private api: ApiService) { }

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
    state = state || new State(mode, id, queryParams);
    this.init(state);
  }

  init(state: State) {
    state.process(this.api).subscribe(() => {
      console.log('PROCESSED STATE', state);
      this.state.next(state);
    });
  }
}
