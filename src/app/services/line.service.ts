import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { LineData } from '../classes/line-data';

@Injectable()
export class LineService {

  private readonly url = 'http://localhost:70/';
  private readonly line_endpoint = 'line';
  
  private line_data = new Array<LineData>(); 
  genres: String[];
  decades: String[];
  
  private loading = false;  
  private error = false;

  loadingSubject = new BehaviorSubject<boolean>(this.getLoading());
  analysisSubject = new BehaviorSubject<LineData[]>(this.getLineData());
  errorSubject = new BehaviorSubject<boolean>(this.getError());

  constructor(private http: HttpClient) {}

 
  // getLine(search:string, synonyms:string){
  getLine(search: string, synonyms: string){
      console.log('>>> enter getLine()');
      this.setLoading(true);
      this.setError(false);
      this.setLineData(new Array<LineData>());
      let qs = new HttpParams()
        .set('word', search)
        .set('synonym', synonyms); 
      this.http.get(this.url + this.line_endpoint, {params: qs})
      // this.http.get(this.url + this.line_endpoint) 
        .subscribe(
          result => {
            console.log(">>> line result: ", result);          
            this.setLineData(this.fillLineData(result));
            this.setLoading(false);
            this.setError(false);
          },
          error => {
            this.setLineData(new Array<LineData>());
            this.setLoading(false);
            this.setError(true);
          }
        );
  }  


  getError(){
    return this.error;
  }

  getLineData(){
    return this.line_data;
  }

  getLoading(){
    return this.loading;
  }

  setError(result:boolean){
    this.error = result;
    this.errorSubject.next(result);
  }

  setLineData(result:Array<LineData>){
    this.line_data = result;
    this.analysisSubject.next(result);
  }

  setLoading(result:boolean){
    this.loading = result;
    this.loadingSubject.next(result);
  }

  fillLineData(result: any):Array<LineData>{
    let data = new Array<LineData>();
    for(let r of result){      
      data.push({
        negativity_positivity: r["Negativity.Positivity"],
        cold_warm: r["cold.warm"],
        incompetence_competence: r["incompetence.competence"],
        decade: r["decade"],
        genre: r["genre"],  
      });
    }
    return data;  
  }
}
