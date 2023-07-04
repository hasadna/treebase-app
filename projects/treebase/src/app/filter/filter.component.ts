import { Component } from '@angular/core';
import { StateService } from '../state.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { State } from '../state';

@UntilDestroy()
@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.less']
})
export class FilterComponent {
  mode: string;

  constructor(public stateSvc: StateService) {
    this.stateSvc.state.pipe(
      untilDestroyed(this)
    ).subscribe(state => {
      this.state = state;
    });
  }

  set state(state: State ) {
    if (state.mode.indexOf('tree') === 0) {
      this.mode = 'trees';
    } else if (state.mode.indexOf('muni') === 0) {
      this.mode = 'munis';
    } else if (state.mode.indexOf('stat-area') === 0) {
      this.mode = 'stat-areas';
    } else {
      this.mode = 'none';
    }
  }

}
