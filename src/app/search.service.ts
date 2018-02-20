import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { SearchResult } from './search-result';

@Injectable()
export class SearchService {

  private readonly url = 'http://localhost/';
  private readonly search_endpoint = 'context';
  private readonly fullText_endpoint = 'fullText';
  private readonly defaultWindow = 20;

  private data_rows = new Array<SearchResult>();
  private loading = false;
  private fullTextItem = new SearchResult();
  private error = false;

  dataSubject = new BehaviorSubject<SearchResult[]>(this.getData());
  loadingSubject = new BehaviorSubject<boolean>(this.getLoading());
  fullTextSubject = new BehaviorSubject<SearchResult>(this.getFullTextItem());
  errorSubject = new BehaviorSubject<boolean>(this.getError());

  constructor(private http: HttpClient) {}

  getSearchList(search:string, synonyms:string, window:string) {
    console.log('>>> enter getSearchList()');
    this.setLoading(true);
    this.setData(new Array<SearchResult>());
    let qs = new HttpParams()
      .set('keyword', !search? " ": search)
      .set('synonyms', !synonyms? " ": synonyms)
      .set('window', !isNaN(parseInt(window))? this.defaultWindow.toString(): window);
    //search
    this.http.get(this.url + this.search_endpoint, {params: qs})
      .take(1) //from observable take 1 from the stream
      .toPromise()
      .then(
        (result) => {
          this.setData(this.fillData(result));
          this.setLoading(false);
          this.setError(false);
        }
      )
      .catch(
        (error) => {
          this.setData(new Array<SearchResult>());
          this.setLoading(false);
          this.setError(true);
        }
      );
  }

  getFullText(id:string){
    console.log('>>> enter getFullText()');
    this.setLoading(true);
    this.setFullText(new SearchResult());
    let qs = new HttpParams().set('id', !id? "": id)
    this.http.get(this.url + this.fullText_endpoint, {params: qs})
      .take(1) //from observable take 1 from the stream
      .toPromise()
      .then(
        (result) => {
          console.log('>>> result of getFullText() ' + result[0].toString());
          this.setFullText({
            text_id: result[0]["Text_ID"],
            year: result[0]["Year"],
            genre: result[0]["Genre"],
            title: result[0]["Title"],
            context: result[0]["Text"]
          });
          this.setLoading(false);
          this.setError(false);
        }
      )
      .catch(
        (error) => {
          this.setData(new Array<SearchResult>());
          this.setLoading(false);
          this.setError(true);
        }
      );
  }

  getError(){
    return this.error;
  }

  getFullTextItem(){
    return this.fullTextItem;
  }

  getData(){
    return this.data_rows;
  }

  getLoading(){
    return this.loading;
  }

  setError(result:boolean){
    this.error = result;
    this.errorSubject.next(result);
  }

  setFullText(result:SearchResult){
    this.fullTextItem = result;
    this.fullTextSubject.next(result);
  }

  setData(result:Array<SearchResult>){
    this.data_rows = result;
    this.dataSubject.next(result);
  }

  setLoading(result:boolean){
    this.loading = result;
    this.loadingSubject.next(result);
  }

  fillData(result: any):Array<SearchResult>{
    let data = new Array<SearchResult>();
    for(let r of result){
      data.push({
        text_id: r["Text_ID"],
        year: r["Year"],
        genre: r["Genre"],
        title: r["Title"],
        context: r["Context"]
      });
    }
    return data;
  }

}
