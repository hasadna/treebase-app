import { Component } from '@angular/core';
import { StateService } from '../state.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FilterItem, State } from '../states/base-state';
import { Router } from '@angular/router';

@UntilDestroy()
@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.less']
})
export class FilterComponent {
  mode: string;
  controls: FilterItem[] = [];
  filters: any = {};
  _selected: any = {};
  _checked: any = {};

  constructor(public stateSvc: StateService, private router: Router) {
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
    this.controls = state.filterItems || [];
    this.filters = state.filters || {};
    this.controls.filter(control => control.kind === 'select').forEach(control => {
      this._selected[control.id] = this.filters[control.id] || control.options[0].value;
    });
    this.controls.filter(control => control.kind === 'check').forEach(control => {
      this._checked[control.id] = this.filters[control.id] !== '0';
    });
  }

  updateCheck(id: string, element: EventTarget | null) {
    if (!element) {
      return;
    }
    const checked = (element as HTMLInputElement).checked;
    const queryParams: any = {};
    queryParams[id] = checked ? '1' : '0';
    this.router.navigate([], {
      queryParams,
      replaceUrl: true,
      queryParamsHandling: 'merge',
    });
  }

  selectValue(id: string, event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this._selected[id] = value;
    const queryParams: any = {};
    queryParams[id] = value;
    this.router.navigate([], {
      queryParams,
      replaceUrl: true,
      queryParamsHandling: 'merge',
    });
  }
}
