import { Component } from '@angular/core';
import { taxonomy } from "../taxonomy";
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
  treeExtra: any = {};
  sources: any[] = [];
  streetView: SafeUrl;
  extraItems: any[] = [];
  processedData: any[] = [];

  constructor(private sanitizer: DomSanitizer) {
  }

  set state(state: State | null) {
    if (state === null) {
      this.tree = null;
      this.sources = [];
      return;
    }
    if (state.data[0] === this.processedData) {
      return;
    }
    this.processedData = state.data[0];
    this.sources = [];
    this.tree = {};
    this.treeExtra = {};
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
        if (!!row[key]) {
          this.treeExtra[key] = this.treeExtra[key] || [];
          let found = false;
          let values = [row[key]];
          if (values[0]?.indexOf && values[0].indexOf('http') === 0) {
            values = values[0].split(' ');
          }
          console.log('VALUES', key, values);
          for (const value of values) {
            for (const item of this.treeExtra[key]) {
              if (item.value === value) {
                found = true;
                item['source'] = item['source'] + ', ' + row['meta-source'];
                break;
              }
            }
            if (!found) {
              this.treeExtra[key].push({
                source: row['meta-source'],
                value
              });  
            }
          }
        }
      }
    }
    this.sources = this.sources.sort((a, b) => a.date.localeCompare(b.date));
    this.streetView = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.google.com/maps/embed/v1/streetview?location=${this.tree["location-y"]},${this.tree["location-x"]}&key=${MAPS_API_KEY}`);
    this.extraItems = [];
    for (const item of taxonomy) {
      if (!!this.tree[item.name]) {
        const rec = Object.assign({values: this.treeExtra[item.name]}, item);
        if (rec.type === 'string' && rec.values[0].value.indexOf('http') === 0) {
          rec.type = 'photo';
          rec.values = rec.values.map((v: any) => {
            return {
              source: v.source,
              value: this.sanitizer.bypassSecurityTrustResourceUrl(v.value)
            };
          });
        }
        this.extraItems.push(rec);
      }
    }
    console.log('EXTRA ITEMS');
    console.table(this.extraItems);
  }

  toNumber(value: any, digits: number = 1) {
    try {
      const ret = parseFloat(value);
      return ret.toFixed(digits);
    } catch (e) {
      return value;
    }
  }

  toBoolean(value: any) {
    return !!value ? 'כן' : 'לא';
  }

  toImage(value: any) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }
}
