import { Component, OnInit, ElementRef, ViewEncapsulation, OnDestroy, Input } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toPromise';

import { AnalysisData } from '../../classes/analysis-data';
import { AnalysisService } from '../../services/analysis.service';

import * as d3 from 'd3';
// import * as d3Chromatic from 'd3-scale-chromatic';
import { forEach } from '@angular/router/src/utils/collection';

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
  isLoading: boolean;
  hasError: boolean;

  constructor(
    private element: ElementRef,
    private http: HttpClient,
    private analysisService: AnalysisService,
    private route: ActivatedRoute,
    private router: Router
  ){ } 

  ngOnInit(){
    console.log('>>> BubbleChartComponent on init');
    this.subscribeData();
    this.subscribeLoading();
    this.subscribeError();
    this.generateBubbleChart();
  }

  subscribeError(){
    this.subHasError = this.analysisService.errorSubject.subscribe(
      (data) => {
        console.log('>>> analysis >>> data in error subject subscription ' + data);
        this.hasError = data;
      },
      (error) => {
        console.log('>>> analysis >>> error in loading subject subscription ' + error);
      }
    )
  }

  subscribeLoading(){
    this.subIsLoading = this.analysisService.loadingSubject.subscribe(
      (data) => {
        console.log('>>> analysis >>> data in loading subject subscription ' + data);
        this.isLoading = data;
      },
      (error) => {
        console.log('>>> analysis >>> error in loading subject subscription ' + error);
      }
    )
  }

  subscribeData(){
    this.subData = this.analysisService.analysisSubject.subscribe(
      (data) => {
        console.log('>>> analysis >>> data in analysis subject subscription ' + data.length);
        this.analysis_data = data;
      },
      (error) => {
        console.log('>>> analysis >>> error in analysis subject subscription ' + error);
      }
    )
  }

  ngOnDestroy() {
    this.subData.unsubscribe();
    this.subIsLoading.unsubscribe();
    console.log(">>> BubbleChartComponent destroyed");
  }

  generateBubbleChart(){

    var diameter = 960,
    format = d3.format(",d"),
    //color = d3.scaleSequential(d3Chromatic.interpolateRdYlBu);
    color = d3.scaleOrdinal()
      .domain([1,2,3,4,5])
      .range(["#FC1212","#F5894E","#DEDAD7","#AFC7F0","387AEB"]);

    var bubble = d3.pack()
        .size([diameter, diameter])
        .padding(1.5);

    var svg = d3.select(this.element.nativeElement).append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");
    
    // Returns a flattened hierarchy containing all leaf nodes under the root. 

    // var root = d3.hierarchy(this.classes(this.flaredata))
    //      .sum(function(d) { return d.value; })
    //      .sort(function(a, b) { return b.value - a.value; });
    if(this.analysis_data.length!=0){
      console.log(">>> entered here = this.analysis_data return true");
      console.log(">>> analysis_data: " + this.analysis_data);
      var root = d3.hierarchy(this.classes(this.analysis_data))
          .sum(function(d) { 
            console.log(">>> in sum > d.data.freq: " + d.freq );
            return d.freq; 
          })
          .sort(function(a, b) { 
            console.log(">>> in sum > a.data.freq: " + a.data.freq );
            console.log(">>> in sum > b.data.freq: " + b.data.freq );
            return b.data.freq - a.data.freq; 
          });    

      bubble(root);
      var node = svg.selectAll(".node")
          .data(root.children)
        .enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

      node.append("title")
          .text(function(d) { return d.data.word + ": " + format(d.data.freq); });

      node.append("circle")
          .attr("r", function(d) { return d.r; })
          .style("fill", function(d) { 
            console.log(">>> category: " + d.data.neg_pos);                
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
}
