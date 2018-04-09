import { Component, OnInit, ElementRef, ViewEncapsulation, OnDestroy, Input, ViewChild} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toPromise';

import { AnalysisData } from '../../classes/analysis-data';
import { AnalysisService } from '../../services/analysis.service';
import { Range } from '../../classes/range';

import * as d3 from 'd3';
// import * as d3Chromatic from 'd3-scale-chromatic';
import { forEach } from '@angular/router/src/utils/collection';
import { CheckValue } from '../../classes/check-value';

@Component({
  selector: 'app-bubble-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './bubble-chart.component.html',
  styleUrls: ['./bubble-chart.component.css']
})
export class BubbleChartComponent implements OnInit {

  private subData: Subscription;
  private subIsLoading: Subscription;
  private subHasError: Subscription;

  analysis_data = new Array<AnalysisData>();
  filtered_data = new Array<AnalysisData>();
  
  isLoading: boolean;
  hasError: boolean;

  // decades = new Array<String>();
  selected_genres = new Array<CheckValue>();

  decade_range = new Range;
  selected_decade_range = new Range;

  freq_range = new Range;
  selected_freq_range = new Range;

  chart_width: Number;

  @ViewChild('filterForm')
  filterForm: NgForm;

  constructor(
    private http: HttpClient,
    private analysisService: AnalysisService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ){ } 

  ngOnInit(){
    console.log('>>> BubbleChartComponent on init');
    // d3.select(this.element.nativeElement).select("svg > *").remove();
    // d3.select(this.element.nativeElement).select("svg").remove();
    console.log(">>> cahrt div",d3.select("#chart")["_groups"][0][0]["clientWidth"]);
    // this.chart_width = d3.select("#chart").node().getBoundingClientRect().width;
    this.chart_width = d3.select("#chart")["_groups"][0][0]["clientWidth"];
    console.log(">>> chart width", this.chart_width);

    this.subscribeData();
    this.subscribeLoading();
    this.subscribeError();       
    
  }  

  subscribeError(){
    this.subHasError = this.analysisService.errorSubject.subscribe(
      (data) => {
        console.log('>>> analysis >>> data in error subject subscription ', data);
        this.hasError = data;
      },
      (error) => {
        console.log('>>> analysis >>> error in loading subject subscription ', error);
      }
    )
  }

  subscribeLoading(){
    this.subIsLoading = this.analysisService.loadingSubject.subscribe(
      (data) => {
        console.log('>>> analysis >>> data in loading subject subscription ', data);
        this.isLoading = data;
      },
      (error) => {
        console.log('>>> analysis >>> error in loading subject subscription ', error);
      }
    )
  }

  subscribeData(){
    this.subData = this.analysisService.analysisSubject.subscribe(
      (data) => {
        console.log('>>> analysis >>> data in analysis subject subscription ', data.length);
        this.analysis_data = data;
        // this.filtered_data = this.analysisService.filtered_data;
        if(this.analysis_data.length>0){               
          this.setGenres(this.analysis_data);
          this.setFrequency(this.analysis_data);
          this.setDecades(this.analysis_data);
          this.filter();
          // this.analysisService.setSliderRange(this.selected_genres, this.freq_range,this.decade_range);
          this.generateBubbleChart();
        }
      },
      (error) => {
        console.log('>>> analysis >>> error in analysis subject subscription ', error);
      }
    )
  }

  ngOnDestroy() {
    this.subData.unsubscribe();
    this.subIsLoading.unsubscribe();
    this.subHasError.unsubscribe();
    console.log(">>> BubbleChartComponent destroyed");
  }

  generateBubbleChart(){
    let sumData = this.sumDataFreq(this.filtered_data);

    console.log(">>> div chart", d3.select("#chart"));
    
    d3.select("#chart").selectAll("svg").remove();

    var diameter = this.chart_width,
    format = d3.format(",d"),
    //color = d3.scaleSequential(d3Chromatic.interpolateRdYlBu);
    color = d3.scaleOrdinal()
      .domain([1,2,3,4,5])
      .range(["#FC1212","#F5894E","#DEDAD7","#AFC7F0","387AEB"]);

    var bubble = d3.pack()
        .size([diameter, diameter])
        .padding(1.5);   

    var svg = d3.select("#chart").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");
    
    if(sumData.length!=0){
      console.log(">>> entered here = this.analysis_data return true");
      console.log(">>> filtered_data: ", sumData);
      var root = d3.hierarchy(this.classes(sumData))
          .sum(function(d) { 
            console.log(">>> in sum > d: ", d);
            console.log(">>> in sum > d.freq: ", d.freq);
            
            return d.freq; 
          })
          .sort(function(a, b) { 
            console.log(">>> in sum > a.data.freq: ", a.data );
            console.log(">>> in sum > b.data.freq: ", b.data );
            return b.data.freq - a.data.freq; 
          });    

      console.log(">>> what is root", root);

      bubble(root);
      var node = svg.selectAll(".node")
          .data(root.children)
        .enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) { 
            console.log(">>> what is d? ", d);
            return "translate(" + d.x + "," + d.y + ")"; 
          });

      node.append("title")
          .text(function(d) { return d.data.word + ": " + format(d.data.freq); });

      node.append("circle")
          .attr("r", function(d) { return d.r; })
          .style("fill", function(d) { 
            console.log(">>> category: ", d.data.neg_pos);                
            return color(d.data.neg_pos); 
          });

      node.append("text")
          .attr("dy", ".3em")
          .style("text-anchor", "middle")
          .text(function(d) { return d.data.word; });
      
      d3.select(self.frameElement).style("height", diameter + "px");
    }
  }
  
  classes(root) {
    return {children: root};
  }

  sumDataFreq(data: AnalysisData[]){
    let sumData = new Array<AnalysisData>();
    data.forEach(d=>{
      let hasData = false;
      sumData.forEach(s=>{
        if(s.word==d.word){
          s.freq+=d.freq;
          hasData = true;
        }
      });
      if(!hasData){
        sumData.push(d);
      }    
    });
    return sumData;
  }

  setGenres(data: AnalysisData[]){
    data.forEach((d)=>{
      if(!this.selected_genres.some(genre=>{return genre.name == d.genre;})){
        this.selected_genres.push({
          name: d.genre,
          checked: true
        })
      }
    })
    console.log(">>> selected_genres: ", this.selected_genres);      
  }

  setDecades(data: AnalysisData[]){
    this.decade_range.from = Math.min(...data.map(d=>{return Number(d.decade.replace("s",""))}));
    this.decade_range.to = Math.max(...data.map(d=>{return Number(d.decade.replace("s",""))}));    

    this.selected_decade_range.from = this.decade_range.from;
    this.selected_decade_range.to = this.decade_range.to;    

    console.log(">>> decade_range: ", this.decade_range);  
    console.log(">>> selected decade_range: ", this.selected_decade_range);   

  }

  setFrequency(data: AnalysisData[]){     
    this.freq_range.from = Math.min(...data.map(d=>{return d.freq}));
    this.freq_range.to = Math.max(...data.map(d=>{return d.freq}));

    this.selected_freq_range.from = this.freq_range.from;
    this.selected_freq_range.to = this.freq_range.to;    

    console.log(">>> freq_range: ", this.freq_range); 
    console.log(">>> selected freq_range: ", this.selected_freq_range);
  }

  filter(){
    // this.filtered_data = this.analysisService.filterData(this.selected_genres, this.selected_decade_range, this.selected_freq_range);
    console.log(">>> freq_range: ", this.freq_range); 
    console.log(">>> selected freq_range: ", this.selected_freq_range);
    console.log(">>> decade_range: ", this.decade_range);  
    console.log(">>> selected decade_range: ", this.selected_decade_range);
    this.filtered_data = this.analysis_data
      .filter(data=>this.selected_genres.some(genre=>genre.name == data.genre && genre.checked))
      .filter(data=>Number(data.decade.replace("s",""))>=this.selected_decade_range.from 
        && Number(data.decade.replace("s",""))<=this.selected_decade_range.to)
      .filter(data=>data.freq>=this.selected_freq_range.from
        && data.freq<=this.selected_freq_range.to);
    
    console.log(">>> filtered data: ", this.filtered_data);          
  }

  doFilter(){
    this.filter();
    this.generateBubbleChart();
  }

  // isGenreSelected(genre:String){
  //   if(!this.selected_genres){
  //     return "false";
  //   }
  //   for(let g of this.selected_genres){
  //     if(g==genre){
  //       return "selected";
  //     }
  //   }
  //   return "false";
  // }

  decadeOnUpdate(event:any){
    console.log(">>> decadeOnUpdate:", event);
    // this.selected_decade_range.from = event.from;
    // this.selected_decade_range.to = event.to;    
  }
  decadeOnChange(event:any){
    console.log(">>> decadeOnChange:", event);
    this.selected_decade_range.from = event.from;
    this.selected_decade_range.to = event.to;   
  }
  decadeOnFinish(event:any){
    console.log(">>> decadeOnFinish:", event);
    this.doFilter();
  }

  freqOnUpdate(event:any){
    console.log(">>> freqOnUpdate:", event);
  }
  freqOnChange(event:any){
    console.log(">>> freqOnChange:", event);
    
    console.log(">>> freq_range: ", this.freq_range); 
    console.log(">>> selected freq_range: ", this.selected_freq_range);
    console.log(">>> decade_range: ", this.decade_range);  
    console.log(">>> selected decade_range: ", this.selected_decade_range);
    this.selected_freq_range.from = event.from;
    this.selected_freq_range.to = event.to;
    console.log(">>> freq_range: ", this.freq_range); 
    console.log(">>> selected freq_range: ", this.selected_freq_range);
    console.log(">>> decade_range: ", this.decade_range);  
    console.log(">>> selected decade_range: ", this.selected_decade_range);
  }
  freqOnFinish(event:any){
    console.log(">>> freqOnFinish:", event);
    this.doFilter();
  }

  onResize(event: Event) {
    // console.log(">>> resize event", event);
    //console.log(">>> d3 element", d3.select("#chart").node().getBoundingClientRect());
    // this.chart_width = d3.select("#chart").node().getBoundingClientRect();
    this.chart_width = d3.select("#chart")["_groups"][0][0]["clientWidth"];
    if(this.analysis_data.length > 0){
      this.generateBubbleChart();
    }
  }

}
