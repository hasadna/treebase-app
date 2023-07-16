import { Component } from '@angular/core';
import { State } from '../states/base-state';
import { QP_REGION_COLORING, QP_REGION_COLORING_CAR, QP_REGION_COLORING_CPC } from '../states/consts-regions';

@Component({
  selector: 'app-stat-area',
  templateUrl: './stat-area.component.html',
  styleUrls: ['./stat-area.component.less']
})
export class StatAreaComponent {

  stat_area: any = null;
  sources: any[] = [];
  name = '';

  set state(state: State | null) {
    console.log('GOET STATE', state);
    if (state === null) {
      this.stat_area = null;
      this.sources = [];
      this.name = '';
      return;
    }
    this.stat_area = Object.assign({}, state.data[0][0] || {}, state.data[2][0] || {});
    this.sources = [];
    this.name = `אזור סטטיסטי ${this.stat_area['city_code']}/${this.stat_area['area_code'] || '0'}`
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
