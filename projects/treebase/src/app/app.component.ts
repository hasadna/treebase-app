import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Route, Router, RouterEvent } from '@angular/router';
import { ReplaySubject, filter, map, mergeMap, switchMap, tap } from 'rxjs';
import { State, StateMode } from './state';
import { StateService } from './state.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  
  constructor(private route: ActivatedRoute, private router: Router, private state: StateService) { 
    this.router.events.pipe(
      untilDestroyed(this),
      filter((event) => event instanceof NavigationEnd),
      map((event) => (event as NavigationEnd).url.split('?')[0].split('/').filter(x => x.length > 0)),
    ).subscribe((segments: string[]) => {
      console.log('url changed', segments);
      this.state.initFromUrl(segments);
    });
  }
}
