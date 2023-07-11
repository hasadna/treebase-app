import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { State } from '../states/base-state';
import { Subject, debounceTime, distinctUntilChanged, switchMap, timer } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ApiService, SearchResult } from '../api.service';
import { Router } from '@angular/router';

@UntilDestroy()
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less']
})
export class SearchComponent {
  @Input() state: State;

  @ViewChild('input') input: ElementRef<HTMLInputElement>;

  terms = new Subject<string>();
  results: SearchResult[] = [];

  constructor(private api: ApiService, public router: Router) {
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
