import { Component, OnInit, ElementRef, ViewEncapsulation, OnDestroy, Input, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toPromise';

import { LineData, LineDataType } from '../../classes/line-data';
import { LineService } from '../../services/line.service';

import * as d3 from 'd3';
import { CheckValue } from '../../classes/check-value';

@Component({
    selector: 'app-line-chart',
    templateUrl: './line-chart.component.html',
    styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {

    private subData: Subscription;
    private subIsLoading: Subscription;
    private subHasError: Subscription;

    line_data = new Array<LineData>();
    filtered_data = new Array<LineData>();
    isLoading: boolean;
    hasError: boolean;

    display_options = new Array<CheckValue>();
    line_data_type = LineDataType;
    selected_data_type: string;

    string_bestFit = "Show Best Fit";
    string_path = "Show Path";
    string_pathBestFit = "Show Path & Best Fit"

    selected_categories = new Array<CheckValue>();

    format2d = d3.format("0.1f");

    chart_width: number;
    chart_height: number;

    constructor(
        private element: ElementRef,
        private http: HttpClient,
        private lineService: LineService,
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
    ) { }

    ngOnInit() {
        this.display_options.push({
            name: this.string_bestFit,
            checked: true
        });
        this.display_options.push({
            name: this.string_path,
            checked: false
        });
        this.display_options.push({
            name: this.string_pathBestFit,
            checked: false
        });

        this.chart_width = d3.select("#chart")["_groups"][0][0]["clientWidth"];
        this.chart_height = window.innerHeight * 0.5;

        console.log(">>> selected_data_type:",this.line_data_type);
        this.selected_data_type = this.line_data_type[0];
        

        this.subscribeData();
        this.subscribeLoading();
        this.subscribeError(); 
    }

    subscribeError() {
        this.subHasError = this.lineService.errorSubject.subscribe(
            (data) => {
                console.log('>>> line >>> data in error subject subscription ', data);
                this.hasError = data;
            },
            (error) => {
                console.log('>>> line >>> error in error subject subscription ', error);
            }
        )
    }

    subscribeLoading() {
        this.subIsLoading = this.lineService.loadingSubject.subscribe(
            (data) => {
                console.log('>>> line >>> data in loading subject subscription ', data);
                this.isLoading = data;
            },
            (error) => {
                console.log('>>> line >>> error in loading subject subscription ', error);
            }
        )
    }

    subscribeData() {
        this.subData = this.lineService.analysisSubject.subscribe(
            (data) => {
                console.log('>>> line >>> data in analysis subject subscription ', data.length);
                this.line_data = this.filtered_data = data;

                if (this.line_data.length > 0) {
                    this.getCategories(this.line_data).forEach((d) => {
                        this.selected_categories.push({
                            name: d,
                            checked: true
                        })
                    });

                    this.generateLineChart(this.selected_data_type);
                }
            },
            (error) => {
                console.log('>>> line >>> error in analysis subject subscription ', error);
            }
        )
    }

    ngOnDestroy() {
        this.subData.unsubscribe();
        this.subIsLoading.unsubscribe();
        this.subHasError.unsubscribe();
        console.log(">>> LineChartComponent destroyed");
    }

    generateLineChart(selected_data_type:string) {
        d3.select(this.element.nativeElement).select("svg").remove();

        var margin = { top: 10, right: 150, bottom: 40, left: 40 };
        var width = this.chart_width - margin.left - margin.right;
        var height = this.chart_height - margin.top - margin.bottom;

        var maxDecade = Math.max(...this.filtered_data.map(function (d) {
            return Number(d.decade.replace("s", ""));
        }));
        var minDecade = Math.min(...this.filtered_data.map(function (d) {
            return Number(d.decade.replace("s", ""));
        }));

        var yMax = Math.max(...this.filtered_data.map(function (d) {
            return d[selected_data_type];
        }));

        var yMin = Math.min(...this.filtered_data.map(function (d) {
            return d[selected_data_type];
        }));

        yMax = yMax + 0.2 > 5 ? 5 : yMax + 0.2;
        yMin = yMin - 0.2 < 0 ? 0 : yMin - 0.2;


        // X scale
        var xScale = d3.scaleLinear()
            .domain([minDecade, maxDecade])
            .range([0, width]);

        // Y scale
        var yScale = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([height, 0]);

        // Draw SVG
        var svg = d3.select(this.element.nativeElement).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Draw axes
        var xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat((d)=>{
                return d+"s";
            });

        this.getCategories(this.filtered_data).forEach((category, i)=>{
            var xStart = (width+50);
            var yStart = i*30;
            var legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + xStart + "," + yStart +")");
            legend.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 10)
                .attr("y2", 0)
                .classed("legend-line", true)
                .style("stroke", this.getStroke(category))
                .style("stroke-width", this.getStrokeWidth(category));
            legend.append("text")
                .text(category)
                .attr("transform", "translate(" + 15 + "," + 0 +")")
                .attr("alignment-baseline","central")                
                .style("font-size","0.8em");
        });        

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("fill", "#000")
            .attr("y", 20)
            .attr("x", width)
            .attr("dy", "1em")
            .attr("text-anchor", "end")
            .text("Decade");

        var yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(5);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("fill", "#000")
            // .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", 10)
            // .attr("dy", "1em")
            .attr("text-anchor", "start")
            .text("Average " + this.getTitle(this.selected_data_type));

        // equ text in top left
        // var eqText = svg.append("text")
        //     .attr("id", "eq-text")
        //     .style("text-anchor", "start")
        //     .attr("x", 8)
        //     .attr("y", 8);

        this.getCategories(this.filtered_data).forEach((category) => {

            console.log(">>> line_data: ", this.filtered_data);

            var categoryData = this.filtered_data.filter((d) => d.genre == category);

            console.log(">>> categoryData: ", categoryData);

            // draw path of data points
            var lineFunction = d3.line()
                .x(function (d) { return xScale(Number(d.decade.replace("s", ""))); })
                .y(function (d) { return yScale(d[selected_data_type]); });

            // get the x and y values for least squares
            var xSeries = categoryData.map(function (d) { return Number(d.decade.replace("s", "")); });
            var ySeries = categoryData.map(function (d) { return d[selected_data_type]; });

            console.log('xSeries: ', xSeries);
            console.log('ySeries: ', ySeries);

            var leastSquaresCoeff = this.leastSquares(xSeries, ySeries, minDecade, maxDecade);

            console.log("slope: ", leastSquaresCoeff.slope);
            console.log("intercept: ", leastSquaresCoeff.intercept);
            console.log("rsquare: ", leastSquaresCoeff.rSquare);
            console.log("xMin: ", leastSquaresCoeff.xMin);
            console.log("yMin: ", leastSquaresCoeff.yMin);
            console.log("xMax: ", leastSquaresCoeff.xMax);
            console.log("yMax: ", leastSquaresCoeff.yMax);        
            
            console.log(">>> display options", this.display_options);
            
            var displayOption = this.display_options.filter(o=>o.checked);

            console.log(">>> option", displayOption);       

            if (displayOption[0].name == this.string_bestFit || displayOption[0].name == this.string_pathBestFit){
                var trendline = svg.append("line")
                .attr("x1", xScale(leastSquaresCoeff.xMin))
                .attr("y1", yScale(leastSquaresCoeff.yMin))
                .attr("x2", xScale(leastSquaresCoeff.xMax))
                .attr("y2", yScale(leastSquaresCoeff.yMax))
                .classed("trendline", true)
                .classed(category.toLowerCase(), true)
                .style("stroke", this.getStroke(category))
                .style("stroke-width", this.getStrokeWidth(category));
            }
            if (displayOption[0].name == this.string_path || displayOption[0].name == this.string_pathBestFit){
                var path = svg.append("path")
                .datum(categoryData)
                .attr("class", "path")
                .attr("d", lineFunction)
                .classed(category.toLowerCase(), true)
                .style("fill", "none")
                .style("stroke", this.getStroke(category))
                .style("stroke-width", this.getStrokeWidth(category))
                .style("opacity", 0.5);   
            }
                
        });



        // d3.select('#eq-text').text("y = " + this.format2d(slope)
        //     + "x + " + this.format2d(intercept));

    }

    leastSquares(xSeries, ySeries, minDecade, maxDecade) {
        var reduceSumFunc = function (prev, cur) { return prev + cur; };

        // 1. Get mean of x, y => xBar , yBar
        var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
        var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

        // 2. Get sum of squares of (x - xBar) => ssXX
        var ssXX = xSeries.map(function (d) { return Math.pow(d - xBar, 2); })
            .reduce(reduceSumFunc);

        // 3. Get sum of squares of (y - yBar) => ssYY
        var ssYY = ySeries.map(function (d) { return Math.pow(d - yBar, 2); })
            .reduce(reduceSumFunc);

        // 4. Get sum of squares of (x - xBar)(y - yBar) => ssXY
        var ssXY = xSeries.map(function (d, i) { return (d - xBar) * (ySeries[i] - yBar); })
            .reduce(reduceSumFunc);

        // 5. Eqn of line is y = b0 + b1(x)
        // b1 = slope = ssXY / ssXX 
        var slope = ssXY / ssXX;

        // b0 = intercept when x => 0 = y - b1(x)
        var intercept = yBar - (xBar * slope);

        // 6. Get coordinates at minDecade and maxDecade
        var yMin = intercept + slope * minDecade;
        var yMax = intercept + slope * maxDecade;

        // 7. find R Square
        var ssYY_New = xSeries.map(function (d) {
            return (intercept + slope * d);
        }).map(function (d) {
            return Math.pow(d - yBar, 2);
        }).reduce(reduceSumFunc);

        var rSquare = ssYY_New / ssYY;

        //var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

        return {
            slope: slope,
            intercept: intercept,
            rSquare: rSquare,
            xMin: minDecade,
            yMin: yMin,
            xMax: maxDecade,
            yMax: yMax,
        };
    }

    getCategories(data: LineData[]) {
        var catArray = new Array<string>();
        data.forEach(function (d) {
            var hasCat = false;
            catArray.forEach(function (c) {
                if (c == d.genre) {
                    hasCat = true;
                }
            });
            if (!hasCat) {
                catArray.push(d.genre);
            }
        });
        return catArray;
    }

    getStroke(category: string) {
        switch (category.toLowerCase()) {
            case "average":
                return "black";
            case "nf":
                return "blue";
            case "fic":
                return "green";
            case "news":
                return "orange";
            case "mag":
                return "purple";
        }
    }

    getStrokeWidth(category: string) {
        switch (category.toLowerCase()) {
            case "average":
                return "3px";
            default:
                return "1px";
        }
    }

    filter() {
        this.filtered_data = new Array<LineData>();
        console.log(">>> selected categories: ", this.selected_categories);

        console.log(">>> filter selected categories: ", this.selected_categories.filter(c => c.checked));

        var filtered_categories = this.selected_categories.filter(c => c.checked).forEach(c => {
            console.log(">>> entered forEach:", c);
            this.line_data.forEach(data => {
                console.log(">>> matches? :", data.genre == c.name);

                if (data.genre == c.name) {
                    console.log(">>> push data:", data);
                    this.filtered_data.push(data);
                    console.log(">>> filtered data: ", this.filtered_data);
                }
            })
        });

        console.log(">>>\n>>>\nfiltered data: ", this.filtered_data);
        console.log("\n>>>\n>>>\n");


        this.generateLineChart(this.selected_data_type);
    }

    displayChange(event: Event){
        console.log(">>> radio change event", event);
        this.display_options.forEach(option=>{
            if(option.name == event.target["value"]){
                option.checked = true;
            }
            else{
                option.checked = false;
            }
        });
        this.generateLineChart(this.selected_data_type);
    }

    dataChange(event:Event){
        console.log(">>> selected data change event:", event);
        console.log(">>> selected_data_type:", this.selected_data_type);
        this.generateLineChart(this.selected_data_type);
    }

    getTitle(title:string){
        console.log(">>> getTitle argument:", title);
        let cleaned_title = "";
        title.split("_").forEach((word)=>{
            cleaned_title += word[0].toUpperCase() + word.substring(1).toLowerCase();
            cleaned_title += "."; 
        })
        console.log(">>> cleaned title:", cleaned_title);
        
        return cleaned_title;
    }

    onResize(event: Event) {
        console.log(">>> height of window", window);
        this.chart_width = d3.select("#chart")["_groups"][0][0]["clientWidth"];
        this.chart_height = window.innerHeight * 0.5;
        if(this.line_data.length > 0){
          this.generateLineChart(this.selected_data_type);
        }
      }

}
