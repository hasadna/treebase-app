import { Component } from '@angular/core';
import { StateService } from '../state.service';
import { State } from '../states/base-state';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

const MAPS_API_KEY = 'AIzaSyAW0_GwE7WPDox5RZnUMkESHGiSe5siWdQ';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.less']
})
export class TreeComponent {

  tree: any = null;
  sources: any[] = [];
  streetView: SafeUrl;

  constructor(private sanitizer: DomSanitizer) {
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
    this.streetView = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.google.com/maps/embed/v1/streetview?location=${this.tree["location-y"]},${this.tree["location-x"]}&key=${MAPS_API_KEY}`);
  }
}
