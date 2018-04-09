import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { AnalysisData } from '../classes/analysis-data';
import { Range } from '../classes/range';

@Injectable()
export class AnalysisService {

  private readonly url = 'http://localhost:90/';
  private readonly analysis_endpoint = 'analysis';
  
  private analysis_data = new Array<AnalysisData>(); 
  // genres = [
  //   {name:'FIC', value:'FIC', checked:true},
  //   {name:'MAG', value:'MAG', checked:true},
  //   {name:'NEWS', value:'NEWS', checked:true},
  //   {name:'NF', value:'NF', checked:true}    
  // ];
  decades: Range;
  selected_decades: Range;  
  selected_frequencies: Range;  
  frequencies: Range;
  
  private loading = false;  
  private error = false;

  loadingSubject = new BehaviorSubject<boolean>(this.getLoading());
  analysisSubject = new BehaviorSubject<AnalysisData[]>(this.getAnalysisData());
  errorSubject = new BehaviorSubject<boolean>(this.getError());

  constructor(private http: HttpClient) {}

 
  getAnalysis(search:string, synonyms:string){
      console.log('>>> enter getAnalysis()');
      this.setLoading(true);
      this.setError(false);
      this.setAnaysisData(new Array<AnalysisData>());

      
      console.log(">>> analysis data in service", this.getAnalysisData());
      
      // this.setFullText(new SearchResult());
      let qs = new HttpParams()
        .set('word', search)
        .set('synonym', synonyms);
      this.http.get(this.url + this.analysis_endpoint, {params: qs})
        .subscribe(
          result => {
            console.log(">>> analysis result: ", result);          
            this.setAnaysisData(this.fillAnalysisData(result));
            this.setLoading(false);
            this.setError(false);
          },
          error => {
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
      let decade_genre = r["Dataname"].split("_");
      data.push({
        word: r["word"],
        freq: r["freq_near_target_word"],
        workCheck: r["word_check"],
        neg_pos: r["Negativity.Positivity"],
        dataName: r["Dataname"],
        decade: decade_genre[0],
        genre: decade_genre[1],  
      });
    }
    return data;
  }

  // filterData(genre: String[], decades: String[], freq: Number[]){
  filterData(genres:any, decades: Range, freq: Range){
    // this.decades = decades;
    // this.genres = genres;
    // this.selected_decades = decades;
    // this.selected_frequencies = freq;
    // console.log(">>> filterData genres: ", this.genres);
    // console.log(">>> filterData selected_decades: ", this.selected_decades);  
    // console.log(">>> filterData selected_frequencies: ", this.selected_frequencies); 
      
   
    let result = this.analysis_data
      .filter(data=>genres.some(genre=>genre.name == data.genre && genre.checked))
      .filter(data=>Number(data.decade.replace("s",""))>=this.selected_decades.from 
        && Number(data.decade.replace("s",""))<=this.selected_decades.to)
      .filter(data=>data.freq>=this.selected_frequencies.from
        && data.freq<=this.selected_frequencies.to);
    return result;
  }

  // setSliderRange(genres:any, freq_range:any,decade_range:any){
  //   this.genres = genres;
  //   this.frequencies = freq_range;
  //   this.decades = decade_range;
  // }

}
