import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { State } from '../state';
import { StateService } from '../state.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { delay, tap } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.less']
})
export class ContentComponent implements OnInit{

  @Input() init = false;
  @Input() back: string[] | null = null;
  @Output() state = new EventEmitter<State>();
  
  constructor(private stateSvc: StateService) {
  }

  ngOnInit() {
    this.stateSvc.state.pipe(
      untilDestroyed(this),
    ).subscribe((state) => {
      this.state.emit(state);
    });
  }
    
}
