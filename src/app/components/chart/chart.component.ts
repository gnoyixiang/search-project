import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  redirectTo(route:string){
    console.log(">>> redirectTo() " + route);
    console.log(">>> redirectTo() " + this.router.url);

    this.router.navigate([route]);
  }

  isCurrentRoute(route:string){
    return this.router.url === route;
  }

}
