import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { SearchService } from '../../services/search.service';
import { AnalysisService } from '../../services/analysis.service';
import { LineService } from '../../services/line.service';
import { NarrativeService } from '../../services/narrative.service';

@Component({
  selector: 'app-search-component',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  @ViewChild('searchForm')
  searchForm: NgForm;

  @ViewChild('textSyn')
  textSyn: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private analysisService: AnalysisService,
    private lineService: LineService,
    private narrativeService: NarrativeService
  ) { }

  ngOnInit() {
  }

  search(){
    let keyword = this.searchForm.value.keyword;
    let synonyms = this.searchForm.value.synonyms;
    let window = this.searchForm.value.window;

    this.searchService.getSearchList(keyword, synonyms, window);
    this.analysisService.getAnalysis(keyword, synonyms);
    this.lineService.getLine(keyword, synonyms);
    this.narrativeService.getNarrative(
      keyword, synonyms, this.narrativeService.getGenre(), 
      this.narrativeService.getTimeFrameIndex(this.narrativeService.getTimeframe()));

    this.router.navigate(['/table']);
    // this.router.navigate(['/result/table'],
    //   { queryParams: {
    //       keyword: keyword,
    //       synonyms: synonyms,
    //       window: window
    //     }
    //   });
  }

  clearSynonyms(event: Event){
    console.log(">>> " + this.textSyn);
    this.textSyn.nativeElement.value = "";
  }
}
