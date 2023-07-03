import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { MuniState, MunisState, StatAreaState, StatAreasState, State, StateMode, TreeState, TreesState } from './state';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  state =  new ReplaySubject<State>();

  constructor(private api: ApiService) { }

  initFromUrl(segments: any[]) {
    let mode = segments[0] as StateMode;
    const id = segments[1] ? decodeURIComponent(segments[1]) : undefined;
    let state: State | null = null;
    if (!mode) {
      mode = 'about';
    }
    if (mode === 'trees') {
      if (id) {
        state = new TreeState(id);
      } else {
        state = new TreesState();
      }
    }
    if (mode === 'stat-areas') {
      if (id) {
        state = new StatAreaState(id);
      } else {
        state = new StatAreasState();
      }
    }
    if (mode === 'munis') {
      if (id) {
        state = new MuniState(id);
      } else {
        state = new MunisState();
      }
    }
    state = state || new State(mode, id);
    this.init(state);
  }

  init(state: State) {
    state.process(this.api).subscribe(() => {
      console.log('PROCESSED STATE', state);
      this.state.next(state);
    });
  }
}
