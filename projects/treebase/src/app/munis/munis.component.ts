import { Component } from '@angular/core';
import { State } from '../states/base-state';

@Component({
  selector: 'app-munis',
  templateUrl: './munis.component.html',
  styleUrls: ['./munis.component.less']
})
export class MunisComponent {

  state: State | null = null;

}
