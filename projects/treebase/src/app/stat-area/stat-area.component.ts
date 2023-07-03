import { Component } from '@angular/core';
import { State } from '../state';

@Component({
  selector: 'app-stat-area',
  templateUrl: './stat-area.component.html',
  styleUrls: ['./stat-area.component.less']
})
export class StatAreaComponent {

  stat_area: any = null;
  sources: any[] = [];
  name = '';

  set state(state: State) {
    this.stat_area = state.data[0][0] || {};
    this.sources = [];
    this.name = `איזור סטטיסטי ${this.stat_area['city_code']}/${this.stat_area['area_code'] || '0'}`
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
