import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { State, StateMode } from '../states/base-state';
import { StateService } from '../state.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { delay, filter, tap } from 'rxjs';
import { Router } from '@angular/router';

@UntilDestroy()
@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.less'],
  host: {
    '[class.opened]': 'stateSvc.sidebarOpened || !!back',
  }
})
export class ContentComponent {

  @Input() init = false;
  @Input() mode: StateMode = 'empty';
  @Input() back: string[] | null = null;
  @Output() state = new EventEmitter<State | null>();
  
  state_: State;

  constructor(public stateSvc: StateService, private router: Router) {
    this.stateSvc.state.pipe(
      untilDestroyed(this),
      filter((state) => state.mode === this.mode),
      delay(0),
    ).subscribe((state) => {
      this.state_ = state;
      this.state.emit(state);
    });
    this.stateSvc.loading.pipe(
      untilDestroyed(this),
    ).subscribe(() => {
      this.state.emit(null);
    });
  }

  goBack() {
    if (this.back) {
      this.router.navigate(this.back, {queryParamsHandling: 'merge'});
    }
  }
    
}
