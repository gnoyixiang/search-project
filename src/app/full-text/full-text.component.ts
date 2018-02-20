import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { SearchService } from '../search.service';
import { SearchResult } from '../search-result';

@Component({
  selector: 'app-full-text',
  templateUrl: './full-text.component.html',
  styleUrls: ['./full-text.component.css']
})
export class FullTextComponent implements OnInit, OnDestroy {

  fullTextItem: SearchResult;
  isLoading: boolean;
  hasError: boolean;

  private subFullText: Subscription;
  private subIsLoading: Subscription;
  private subHasError: Subscription;

  constructor(
    private http: HttpClient,
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.subscribeData();
    this.subscribeLoading();
    this.subscribeError();

  }

  subscribeError(){
    this.subHasError = this.searchService.errorSubject.subscribe(
      (data) => {
        console.log('>>> data in error subject subscription ' + data);
        this.hasError = data;
      },
      (error) => {
        console.log('>>> error in loading subject subscription ' + error);
      }
    )
  }

  subscribeData(){
    this.subFullText = this.searchService.fullTextSubject.subscribe(
      (data)=>{
        console.log('>>> data in full text subject subscription ' + data.text_id);
        this.fullTextItem = data;
      },
      (error)=>{
        console.log('>>> error in full text subject subscription ' + error);
      }
    );
  }

  subscribeLoading(){
    this.subIsLoading = this.searchService.loadingSubject.subscribe(
      (data) => {
        console.log('>>> data in loading subject subscription ' + data);
        this.isLoading = data;
      },
      (error) => {
        console.log('>>> error in loading subject subscription ' + error);
      }
    );
  }

  ngOnDestroy() {
    this.subFullText.unsubscribe();
    this.subIsLoading.unsubscribe();
  }

}
