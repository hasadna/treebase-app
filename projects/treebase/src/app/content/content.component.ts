import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { State, StateMode } from '../states/base-state';
import { StateService } from '../state.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { delay, filter, tap } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.less']
})
export class ContentComponent implements OnInit{

  @Input() init = false;
  @Input() mode: StateMode = 'empty';
  @Input() back: string[] | null = null;
  @Output() state = new EventEmitter<State>();
  
  state_: State;

  constructor(private stateSvc: StateService) {
  }

  ngOnInit() {
    this.stateSvc.state.pipe(
      untilDestroyed(this),
      filter((state) => state.mode === this.mode),
      delay(0),
    ).subscribe((state) => {
      this.state_ = state;
      this.state.emit(state);
    });
  }
    
}
