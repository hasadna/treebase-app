import { Component } from '@angular/core';
import { State } from '../states/base-state';

@Component({
  selector: 'app-muni',
  templateUrl: './muni.component.html',
  styleUrls: ['./muni.component.less']
})
export class MuniComponent {

  muni: any = null;
  sources: any[] = [];

  set state(state: State) {
    this.muni = Object.assign({}, state.data[0][0] || {}, state.data[2][0] || {});
    this.sources = [];
    for (const row of state.data[1]) {
      if (row['name'] && row['count']) {
        this.sources.push({
          name: row['name'],
          count: row['count'],
        });
      }
    }
  }

}
