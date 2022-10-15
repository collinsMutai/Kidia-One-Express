import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceService } from 'src/app/services/service.service';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
export interface City {
  id: string;
  city_name:string
}
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers:[DatePipe]
})
export class HomeComponent implements OnInit {
  searchForm: FormGroup;
  cities=[];
  destinations=[];
  filteredOptions: Observable<City[]>;
  destOptions: Observable<City[]>;
  constructor(private formBuilder: FormBuilder,public datePipe:DatePipe,private route:Router,public service:ServiceService) { }

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      date: ['', Validators.required],
      returnDate: [''],
      sourceCity:['', Validators.required],
      city_id:['', Validators.required],
      destCity:['',],
      dest_id:['',],
      type: ['1'],
    });
   
   this.getCities();
   this.filteredOptions = this.searchForm.get('sourceCity').valueChanges.pipe(
    startWith(''),
    map(value => {
       if(value.id){
        this.searchForm.patchValue({"city_id":value.id,"sourceCity":value.city_name})
        this.destination()
      }
      const name = typeof value === 'string' ? value : value?.city_name;
     
      return name ? this._filter(name as string) : this.cities.slice();
    }),
  );


  this.destOptions = this.searchForm.get('destCity').valueChanges.pipe(
    startWith(''),
    map(value => {
       if(value.id){
        this.searchForm.patchValue({"dest_id":value.id,"destCity":value.city_name})
      }
      const name = typeof value === 'string' ? value : value?.city_name;
     
      return name ? this._filterDestinations(name as string) : this.destinations.slice();
    }),
  );
  }
  get f() { return this.searchForm.controls; }

  onSubmit(){
    let data=this.searchForm.value
    if(!data.returnDate){
    this.route.navigate(['buslist',data.city_id,data.dest_id,this.datePipe.transform(data.date,'yyyy-MM-dd'),data.sourceCity,data.destCity])
    }else{
        this.route.navigate(['buslist',data.city_id,data.dest_id,this.datePipe.transform(data.date,'yyyy-MM-dd'),data.sourceCity,data.destCity,this.datePipe.transform(data.returnDate,'yyyy-MM-dd')])
    }
  }
  getCities(){
    this.service.getCities().subscribe((res)=>{
       this.cities = res.data
      })
  }
  
  private _filter(name: string){
    const filterValue = name.toLowerCase();
    return this.cities.filter(option => option.city_name.toLowerCase().includes(filterValue));
  }
  private _filterDestinations(name: string){
    const filterValue = name.toLowerCase();
    return this.destinations.filter(option => option.city_name.toLowerCase().includes(filterValue));
  }

  
  destination(){
    this.service.getDestinations(this.searchForm.get('city_id').value).subscribe((res)=>{
      this.destinations= res.data
    })
  }
}
