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

const appRoutes: Routes = [
  { path: '',
    component: SearchResultWindowComponent,
    children:[
      { path: 'search',
        component: SearchComponent },
      { path: 'table',
        component: ResultTableComponent },
      { path: 'text',
        component: FullTextComponent },
      { path: 'visual',
        component: FullTextComponent },
      { path: '**',
        redirectTo: '/search',
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
    SearchResultWindowComponent
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
