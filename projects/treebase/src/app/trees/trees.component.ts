import { Component } from '@angular/core';
import { State } from '../states/base-state';

@Component({
  selector: 'app-trees',
  templateUrl: './trees.component.html',
  styleUrls: ['./trees.component.less']
})
export class TreesComponent {
  state: State | null = null;
}
