import { Component } from '@angular/core';
import { StateService } from '../state.service';
import { State } from '../state';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.less']
})
export class TreeComponent {

  tree: any = null;
  sources: any[] = [];

  constructor() {
  }

  set state(state: State) {
    console.log('GOTT STATE', state);
    this.sources = [];
    this.tree = {};
    for (const row of state.data[0]) {
      if (row['meta-source'] && row['meta-date'] && row['meta-source-type'] && row['meta-collection-type']) {
        this.sources.push({
          name: row['meta-source'],
          date: row['meta-date'],
          type: row['meta-source-type'],
          collectionType: row['meta-collection-type'],
        });
      }
      for (const key of Object.keys(row)) {
        this.tree[key] = this.tree[key] || row[key];
      }
    }
    this.sources = this.sources.sort((a, b) => a.date.localeCompare(b.date));
  }
}
