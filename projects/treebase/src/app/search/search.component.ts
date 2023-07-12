import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { State } from '../states/base-state';
import { Subject, debounceTime, distinctUntilChanged, map, switchMap, timer } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { StateService } from '../state.service';
import { SearchResult } from '../states/search-types';
import { FocusMode } from '../states/focus-modes';

@UntilDestroy()
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less']
})
export class SearchComponent {
  @ViewChild('input') input: ElementRef<HTMLInputElement>;

  terms = new Subject<string>();
  results: SearchResult[] = [];
  focus: FocusMode | null = null;

  constructor(private api: ApiService, public router: Router, private state: StateService) {
    this.terms.pipe(
      untilDestroyed(this),
      distinctUntilChanged(),
      debounceTime(2000),
      switchMap(term => {
        this.results = [];
        return this.api.search(term);
      }),
    ).subscribe(results => {
      this.results = results;
    });
    this.state.state.pipe(
      untilDestroyed(this),
      distinctUntilChanged((a, b) => a.filters?.focus === b.filters?.focus),
      map(state => state.focus),
    ).subscribe(focus => {
      this.focus = focus;
    });
  }



  change(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    timer(0).subscribe(() => {
      this.terms.next(value);
    });
  }

  handle(result: SearchResult) {
    timer(0).subscribe(() => {
      this.results = [];
      this.input.nativeElement.value = '';
      result.click(this.router);
    });
  }
}
