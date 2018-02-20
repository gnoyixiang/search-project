import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultWindowComponent } from './search-result-window.component';

describe('SearchResultWindowComponent', () => {
  let component: SearchResultWindowComponent;
  let fixture: ComponentFixture<SearchResultWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchResultWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
