import { Component } from '@angular/core';
import { State } from '../state';

@Component({
  selector: 'app-stat-areas',
  templateUrl: './stat-areas.component.html',
  styleUrls: ['./stat-areas.component.less']
})
export class StatAreasComponent {

  state: State | null = null;

}
