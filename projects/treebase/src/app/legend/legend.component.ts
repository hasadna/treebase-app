import { Component, Input } from '@angular/core';
import { Legend } from '../states/base-state';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.less']
})
export class LegendComponent {
  @Input() legend: Legend;
}
