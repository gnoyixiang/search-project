import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule} from "@angular/forms";
import { HttpClientModule} from "@angular/common/http";
import { RouterModule, Routes } from '@angular/router';
import { TabsModule, PaginationModule } from 'ngx-bootstrap';

import { AppComponent } from './app.component';
import { SearchComponent } from './components/search/search.component';
import { ResultTableComponent } from './components/result-table/result-table.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { FullTextComponent } from './components/full-text/full-text.component';
import { SearchResultWindowComponent } from './components/search-result-window/search-result-window.component';
import { ErrorComponent } from './components/error/error.component';
import { NoResultsComponent } from './components/no-results/no-results.component';
import { HomeComponent } from './components/home/home.component';
import { InfoComponent } from './components/info/info.component';
import { BubbleChartComponent } from './components/bubble-chart/bubble-chart.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { ChartComponent } from './components/chart/chart.component';

import { SearchService } from './services/search.service';
import { AnalysisService } from './services/analysis.service';

const appRoutes: Routes = [
  { path: '',
    component: SearchResultWindowComponent,
    children:[
      { path: 'home',
        component: HomeComponent },
      { path: 'table',
        component: ResultTableComponent },
      { path: 'text',
        component: FullTextComponent },
      { path: 'chart',
        component: ChartComponent,
        children:[
          { path: 'line',
            component: LineChartComponent },
          { path: 'bubble',
            component: BubbleChartComponent }
        ]
      },
      { path: '**',
        redirectTo: '/home',
        pathMatch: 'full' }
    ]
  },
];

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    ResultTableComponent,
    PageNotFoundComponent,
    LoadingSpinnerComponent,
    FullTextComponent,
    SearchResultWindowComponent,
    ErrorComponent,
    NoResultsComponent,
    HomeComponent,
    InfoComponent,
    BubbleChartComponent,
    LineChartComponent,
    ChartComponent,
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    TabsModule.forRoot(),
    PaginationModule.forRoot(),
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    SearchService, 
    AnalysisService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
