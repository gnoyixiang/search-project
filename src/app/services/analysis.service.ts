import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { AnalysisData } from '../classes/analysis-data';

@Injectable()
export class AnalysisService {

  private readonly url = 'http://localhost/';
  private readonly analysis_endpoint = 'analysis';
  
  private analysis_data = new Array<AnalysisData>();  
  private loading = false;  
  private error = false;

  loadingSubject = new BehaviorSubject<boolean>(this.getLoading());
  analysisSubject = new BehaviorSubject<AnalysisData[]>(this.getAnalysisData());
  errorSubject = new BehaviorSubject<boolean>(this.getError());

  constructor(private http: HttpClient) {}

  getAnalysis(search:string, synonyms:string){
    console.log('>>> enter getAnalysis()');
    this.setLoading(true);
    // this.setFullText(new SearchResult());
    let qs = new HttpParams()
      .set('word', search)
      .set('synonym', synonyms);
    this.http.get(this.url + this.analysis_endpoint, {params: qs})
      .take(1) //from observable take 1 from the stream
      .toPromise()
      .then(
        (result) => {
          console.log(">>> search result: " + result);          
          this.setAnaysisData(this.fillAnalysisData(result));
          this.setLoading(false);
          this.setError(false);
        }
      )
      .catch(
        (error) => {
          this.setAnaysisData(new Array<AnalysisData>());
          this.setLoading(false);
          this.setError(true);
        }
      );
  }

  getError(){
    return this.error;
  }

  getAnalysisData(){
    return this.analysis_data;
  }

  getLoading(){
    return this.loading;
  }

  setError(result:boolean){
    this.error = result;
    this.errorSubject.next(result);
  }

  setAnaysisData(result:Array<AnalysisData>){
    this.analysis_data = result;
    this.analysisSubject.next(result);
  }

  setLoading(result:boolean){
    this.loading = result;
    this.loadingSubject.next(result);
  }

  fillAnalysisData(result: any):Array<AnalysisData>{
    let data = new Array<AnalysisData>();
    for(let r of result){
      data.push({
        word: r["word"],
        freq: r["freq_near_target_word"],
        workCheck: r["word_check"],
        neg_pos: r["Negativity.Positivity"],
        dataName: r["Dataname"]
      });
    }
    return data;
  }

}
