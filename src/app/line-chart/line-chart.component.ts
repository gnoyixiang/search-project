import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { chart } from "highcharts";
import * as Highcharts from "highcharts";

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {
  @ViewChild("chartTarget") chartTarget: ElementRef;

  chart: Highcharts.ChartObject;

  constructor(private element: ElementRef){
  }

  ngOnInit() {
    function getData(n) {
      var arr = [],
          i,
          x,
          a,
          b,
          c,
          spike;
      for (
          i = 0, x = Date.UTC(new Date().getUTCFullYear(), 0, 1) - n * 36e5;
          i < n;
          i = i + 1, x = x + 36e5
      ) {
          if (i % 100 === 0) {
              a = 2 * Math.random();
          }
          if (i % 1000 === 0) {
              b = 2 * Math.random();
          }
          if (i % 10000 === 0) {
              c = 2 * Math.random();
          }
          if (i % 50000 === 0) {
              spike = 10;
          } else {
              spike = 0;
          }
          arr.push([
              x,
              2 * Math.sin(i / 100) + a + b + c + spike + Math.random()
          ]);
      }
      return arr;
    }
    var n = 500000,
    data = getData(n);

    const options: Highcharts.Options = {
      chart: {
        zoomType: 'x'
      },

      title: {
          text: 'Highcharts drawing ' + n + ' points'
      },

      subtitle: {
          text: 'Using the Boost module'
      },

      tooltip: {
          valueDecimals: 2
      },

      xAxis: {
          type: 'datetime'
      },

      series: [{
          data: data,
          name: 'Hourly data points'
      }]
    };
    this.chart = chart(this.chartTarget.nativeElement, options);
  }

}
