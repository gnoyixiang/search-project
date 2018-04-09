import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-genre',
  templateUrl: './genre.component.html',
  styleUrls: ['./genre.component.css']
})
export class GenreComponent implements OnInit {
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  constructor() { }

  ngOnInit() {
    this.dropdownList = [ 
      {"id":1,"itemName":"FIC"},
      {"id":2,"itemName":"MAG"},
      {"id":3,"itemName":"NEWS"},
      {"id":4,"itemName":"NF"},        
    ];
    this.selectedItems = [        
      {"id":1,"itemName":"FIC"},
      {"id":2,"itemName":"MAG"},
      {"id":3,"itemName":"NEWS"},
      {"id":4,"itemName":"NF"},      
    ];
    this.dropdownSettings = { 
      singleSelection: false, 
      text:"Select Genre",
      selectAllText:'Select All',
      unSelectAllText:'UnSelect All',
      enableSearchFilter: false,
      classes:"myclass custom-class"
    };            
  }
  onItemSelect(item:any){
    console.log(item);
    console.log(this.selectedItems);
  }
  OnItemDeSelect(item:any){
    console.log(item);
    console.log(this.selectedItems);
  }
  onSelectAll(items: any){
    console.log(items);
  }
  onDeSelectAll(items: any){
    console.log(items);
  }
  

}
