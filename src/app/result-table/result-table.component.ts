import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toPromise';

import { SearchService } from '../search.service'
import { SearchResult } from '../search-result'

@Component({
  selector: 'app-result-table-component',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.css']
})
export class ResultTableComponent implements OnInit, OnDestroy {

  private subData: Subscription;
  private subIsLoading: Subscription;
  private subHasError: Subscription;

  data_rows = new Array<SearchResult>();
  isLoading: boolean;
  hasError: boolean;

  maxSize: number = 10;
  bigTotalItems: number = 0;
  bigCurrentPage: number = 1;
  numPages: number = 0;
  itemsPerPage: number = 100;

  constructor(
    private http: HttpClient,
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('>>> ResultTableComponent on init');
    // this.data_rows = this.searchService.dataSubject.getValue();
    // this.isLoading = this.searchService.loadingSubject.getValue();
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

  subscribeLoading(){
    this.subIsLoading = this.searchService.loadingSubject.subscribe(
      (data) => {
        console.log('>>> data in loading subject subscription ' + data);
        this.isLoading = data;
      },
      (error) => {
        console.log('>>> error in loading subject subscription ' + error);
      }
    )
  }

  subscribeData(){
    this.subData = this.searchService.dataSubject.subscribe(
      (data) => {
        console.log('>>> data in data subject subscription ' + data.length);
        this.data_rows = data;
        this.bigTotalItems = this.data_rows.length;
      },
      (error) => {
        console.log('>>> error in data subject subscription ' + error);
      }
    )
  }

  getFullText(id: string){
    this.searchService.getFullText(id);
      // this.router.navigate(['result/text']);
  }

  ngOnDestroy() {
    this.subData.unsubscribe();
    this.subIsLoading.unsubscribe();
    console.log(">>> ResultTableComponent destroyed");
  }



}
