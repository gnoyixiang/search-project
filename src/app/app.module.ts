import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule} from "@angular/forms";
import { HttpClientModule} from "@angular/common/http";
import { RouterModule, Routes } from '@angular/router';
import { TabsModule, PaginationModule } from 'ngx-bootstrap';

import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import { ResultTableComponent } from './result-table/result-table.component';
import { SearchService } from './search.service';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { FullTextComponent } from './full-text/full-text.component';
import { SearchResultWindowComponent } from './search-result-window/search-result-window.component';
import { ErrorComponent } from './error/error.component';
import { NoResultsComponent } from './no-results/no-results.component';
import { HomeComponent } from './home/home.component';
import { InfoComponent } from './info/info.component';

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
      { path: 'visual',
        component: FullTextComponent },
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
    InfoComponent
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
  providers: [SearchService],
  bootstrap: [AppComponent]
})
export class AppModule { }
