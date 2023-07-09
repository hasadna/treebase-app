import { Component, ElementRef, Input, OnChanges, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { State } from '../states/base-state';
import { timer } from 'rxjs';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.less']
})
export class SummaryComponent implements OnChanges {
  @Input() state: State | null = null;
  @Input() name = '';

  @ViewChildren('chart') charts: QueryList<ElementRef>;

  ngOnChanges(): void {
      timer(0).subscribe(() => {
        this.charts.forEach((chart, i) => {
          console.log('CHART', chart, chart.nativeElement, this.state?.charts[i].chart);
          if (this.state?.charts[i].chart) {
            (chart.nativeElement as HTMLElement).appendChild(this.state?.charts[i].chart);
          }
        });
      });
  }
}
