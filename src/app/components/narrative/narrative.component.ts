import { Component, OnInit, ElementRef, ViewEncapsulation, OnDestroy, Input, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toPromise';

import { NarrativeService } from '../../services/narrative.service';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-narrative',
  templateUrl: './narrative.component.html',
  styleUrls: ['./narrative.component.css']
})
export class NarrativeComponent implements OnInit {

  genre_list: any;
  timeframe_list: any;

  selected_genre: string;
  selected_timeframe: string;
  search: string;
  synonyms: string;

  private subData: Subscription;
  private subIsLoading: Subscription;
  private subHasError: Subscription;
  private subGenre: Subscription;
  private subTimeframe: Subscription;
  private subSearch: Subscription;
  private subSynonyms: Subscription;

  narrative_data: any;
  narrative_keys: any;
  narrative_freq: any;
  isLoading: boolean;
  hasError: boolean;

  constructor(
    private http: HttpClient,
    private narrativeService: NarrativeService,
  ) { }

  ngOnInit() {
    this.genre_list = this.narrativeService.genre_list;
    this.timeframe_list = this.narrativeService.timeframe_list;
    this.selected_genre = this.genre_list[0];
    this.selected_timeframe = this.timeframe_list[0];

    this.narrative_data = [];

    console.log(">>> genre_list:", this.genre_list);
    console.log(">>> timeframe_list:", this.timeframe_list);
    console.log(">>> selected_genre:", this.selected_genre);
    console.log(">>> selected_timeframe:", this.selected_timeframe);

    this.subscribeData();
    this.subscribeLoading();
    this.subscribeError();
    this.subscribeGenre();
    this.subscribeTimeFrame();
    this.subscribeSearch();
    this.subscribeSynonyms();
  }

  genreChange(event: Event) {
    console.log(">>> genreChange event:", event);
    console.log(">>> selected genre:",this.selected_genre);
    this.narrativeService.getNarrative(
      this.search, this.synonyms,this.selected_genre,this.narrativeService.getTimeFrameIndex(this.selected_timeframe));
  }

  timeframeChange(event: Event) {
    console.log(">>> timeframeChange event:", event);
    console.log(">>> selected timeframe:",this.selected_timeframe);    
    this.narrativeService.getNarrative(
      this.search, this.synonyms,this.selected_genre,this.narrativeService.getTimeFrameIndex(this.selected_timeframe));    
  }

  

  subscribeError() {
    this.subHasError = this.narrativeService.errorSubject.subscribe(
      (data) => {
        console.log('>>> narrative >>> data in error subject subscription ', data);
        this.hasError = data;
      },
      (error) => {
        console.log('>>> narrative >>> error in error subject subscription ', error);
      }
    )
  }

  subscribeLoading() {
    this.subIsLoading = this.narrativeService.loadingSubject.subscribe(
      (data) => {
        console.log('>>> narrative >>> data in loading subject subscription ', data);
        this.isLoading = data;
      },
      (error) => {
        console.log('>>> narrative >>> error in loading subject subscription ', error);
      }
    )
  }

  subscribeGenre() {
    this.subGenre = this.narrativeService.genreSubject.subscribe(
      (data) => {
        console.log('>>> narrative >>> data in genre subject subscription ', data);
        this.selected_genre = data;
      },
      (error) => {
        console.log('>>> narrative >>> error in genre subject subscription ', error);
      }
    )
  }

  subscribeTimeFrame() {
    this.subTimeframe = this.narrativeService.timeframeSubject.subscribe(
      (data) => {
        console.log('>>> narrative >>> data in timeframe subject subscription ', data);
        this.selected_timeframe = data;
      },
      (error) => {
        console.log('>>> narrative >>> error in timeframe subject subscription ', error);
      }
    )
  }

  subscribeSearch() {
    this.subSearch = this.narrativeService.searchSubject.subscribe(
      (data) => {
        console.log('>>> narrative >>> data in search subject subscription ', data);
        this.search = data;
      },
      (error) => {
        console.log('>>> narrative >>> error in search subject subscription ', error);
      }
    )
  }

  subscribeSynonyms() {
    this.subSynonyms = this.narrativeService.synonymsSubject.subscribe(
      (data) => {
        console.log('>>> narrative >>> data in synonyms subject subscription ', data);
        this.synonyms = data;
      },
      (error) => {
        console.log('>>> narrative >>> error in synonyms subject subscription ', error);
      }
    )
  }

  subscribeData() {
    this.subData = this.narrativeService.narrativeSubject.subscribe(
      (data) => {
        console.log(">>> data of narrative:", !data);
        if(!data){
          this.narrative_data = [];
        }
        if (data) {
          console.log('>>> narrative >>> topic data in narrative subject subscription ', data[0]);
          console.log('>>> narrative >>> freq data in narrative subject subscription ', data[1]);

          this.narrative_keys = Object.keys(data[0][0]);
          console.log('>>> narrative_keys', this.narrative_keys);
          // this.narrative_data = data[0];
          data[0].forEach(element => {
            // console.log('>>> element', element);  
            // console.log('>>> Object.values(element)', Object.values(element));                     
            this.narrative_data.push(Object.values(element));
          });
          var freq_object = [];
          data[1].forEach((element, i) => {                                                        
            if (i > 0) {
              freq_object.push(element["Freq"]);
            }
          });
          this.narrative_freq = freq_object;
          console.log('>>> narrative_data', this.narrative_data);          
        }

      },
      (error) => {
        console.log('>>> narrative >>> error in analysis subject subscription ', error);
      }
    )
  }

  ngOnDestroy() {
    this.subData.unsubscribe();
    this.subIsLoading.unsubscribe();
    this.subHasError.unsubscribe();
    this.subGenre.unsubscribe();
    this.subTimeframe.unsubscribe();
    this.subSearch.unsubscribe();
    this.subSynonyms.unsubscribe();
    console.log(">>> LineChartComponent destroyed");
  }


}
