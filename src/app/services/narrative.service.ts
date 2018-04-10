import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class NarrativeService {

  private readonly url = 'http://localhost:60/';
  private readonly narrative_endpoint = 'narrativeOutput';

  readonly genre_list = ["MAG", "FIC", "NF", "NEWS"];
  readonly timeframe_list = ["1810s-1890s", "1900s-1990s"];
  
//   private table_data: any;
//   private frequency_data: any;
  private narrative_result = null;
  private selected_genre = this.genre_list[0];
  private selected_timeframe = this.timeframe_list[0]; 
  private search = "";
  private synonyms = "";  
  
  private loading = false;  
  private error = false;

  loadingSubject = new BehaviorSubject<boolean>(this.getLoading());
  narrativeSubject = new BehaviorSubject<any>(this.getNarrativeData());
  errorSubject = new BehaviorSubject<boolean>(this.getError());
  genreSubject = new BehaviorSubject<string>(this.getGenre());
  timeframeSubject = new BehaviorSubject<string>(this.getTimeframe());
  searchSubject = new BehaviorSubject<string>(this.getSearch());
  synonymsSubject = new BehaviorSubject<string>(this.getSynonyms());

  constructor(private http: HttpClient) {}

 
  // getLine(search:string, synonyms:string){
  getNarrative(search: string, synonyms: string, genre: string, timeframe: number){
      console.log('>>> enter getLine()');
      this.setLoading(true);
      this.setError(false);
      this.setNarrativeData(null);
      this.setSearch(search);
      this.setSynonyms(synonyms);
      this.setTimeframe(this.getTimeFrameText(timeframe));
      this.setGenre(genre);

      let qs = new HttpParams()
        .set('word', search)
        .set('synonym', synonyms)
        .set('data_genre', genre)
        .set('timeframe', timeframe.toString()); 
      this.http.get(this.url + this.narrative_endpoint, {params: qs})
        .subscribe(
          result => {
            console.log(">>> narrative result: ", result);          
            this.setNarrativeData(result);
            this.setLoading(false);
            this.setError(false);            
          },
          error => {
            this.setNarrativeData(null);
            this.setLoading(false);
            this.setError(true);
          }
        );
  }  


  getError(){
    return this.error;
  }

  getNarrativeData(){
    return this.narrative_result;
  }

  getLoading(){
    return this.loading;
  }

  setError(result:boolean){
    this.error = result;
    this.errorSubject.next(result);
  }

  setNarrativeData(result:any){
    this.narrative_result = result;
    this.narrativeSubject.next(result);
  }

  setLoading(result:boolean){
    this.loading = result;
    this.loadingSubject.next(result);
  }

  getGenre(){
    return this.selected_genre;
  }

  setGenre(genre:string){
    this.selected_genre = genre;
    this.genreSubject.next(genre);
  }

  getTimeframe(){
    return this.selected_timeframe;
  }

  setTimeframe(timeframe:string){
    this.selected_timeframe = timeframe;
    this.timeframeSubject.next(timeframe);
  }

  getSearch(){
    return this.search;
  }

  setSearch(search:string){
    this.search = search;
    this.searchSubject.next(search);
  }

  getSynonyms(){
    return this.synonyms;
  }

  setSynonyms(synonyms:string){
    this.synonyms = synonyms;
    this.synonymsSubject.next(synonyms);
  }

  getTimeFrameIndex(timeframe: string){
    this.timeframe_list.forEach((t,i)=>{
      if(t==timeframe) return i;
    })
    return 1;
  }

  getTimeFrameText(index: number){
    return this.timeframe_list[index];
  }

 
}
