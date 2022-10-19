import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'src/app/services/service.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ReturnService } from 'src/app/services/return.service';
import { CommonService } from 'src/app/services/common.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-return',
  templateUrl: './return.component.html',
  styleUrls: ['./return.component.scss'],
  providers:[DatePipe]
})
export class ReturnComponent implements OnInit {
  buses=[]
  seats=[];
  boarding_points=[];
  dropping_points=[];
  dropping:any={};
  boarding:any={};
  params:any={};
  obj:any={}
  seatList=[]
  total=0
  bus:any={}
  selectedTripData:any={}
  selectedData={}
  reviewInfo:any={};
  continue=false;
  searchForm: FormGroup;
  loading=false;
  @Input() modify=false;
  @ViewChild('reviewModal', { static: false }) reviewModal?: ModalDirective;
  return_min: Date;
  user:any={};
  boardingForm: FormGroup;
  constructor(public service:ServiceService,public activated:ActivatedRoute,private formBuilder: FormBuilder,public returnService:ReturnService,public commonService:CommonService,public route:Router,public datePipe:DatePipe) {
    this.returnService.reset();
   }
  ngOnInit() {
    this.user=JSON.parse(sessionStorage.getItem('loggedUser'));
    this.commonService.review_info.subscribe((res)=>{
     this.reviewInfo=res;
    })
   
    this.returnService.selectedseatdata.subscribe((res)=>{
      this.selectedData=res
    })
    this.returnService.selected_seats.subscribe((res)=>{
      this.seats=res;
    })
    this.returnService.total.subscribe((res)=>{
      this.total=res;
    })
    this.returnService.bording_points.subscribe((res)=>{
      this.boarding_points=res;
    })
    this.returnService.dropping_points.subscribe((res)=>{
      this.dropping_points=res;
    })
    this.returnService.seats.subscribe((res)=>{
      this.seatList=res
    })
    this.returnService.trip_data.subscribe((res)=>{
      this.selectedTripData=res;
    })

   this.activated.paramMap.subscribe((res)=>{ 
    this.params.source_city_id=res.get('id2')
    this.params.destination_city_id= res.get('id1')
    this.params.travel_date =res.get('id6')
    this.params.source_city=res.get('id5');
    this.params.dest_city=res.get('id4');
    this.params.return_date =res.get('id6')
    this.returnService.setBookingParams(this.params)
    
   })
   this.getBuses();
   this.searchForm = this.formBuilder.group({
    returnDate: [''],
   
  });
  this.return_min=new Date(this.params.travel_date)
  this.return_min.setDate(this.return_min.getDate() + 1);
  this.boardingForm = this.formBuilder.group({
    dropping:['', Validators.required],
    boarding:['', Validators.required],
  });
  }
  getBuses(){
    this.loading=false;
    let data= {
      "source_city_id":this.params.source_city_id,
      "destination_city_id":this.params.destination_city_id,
      "travel_date":this.params.return_date,
      "avg_rating": null,
      "departure_time": null,
      "fare": null,
      "seat_type": "",
      "travels": "",
      "boarding_points": [],
      "dropping_points": [],
      "bus_with_amenities": [],
      "high_rating": true,
      "bus_with_live_tracking": false,
      "cabs": false,
      "hot_deals": false,
      "on_time": false,
      "bus_type": [],
      "time_range": [],
      "record_type": "data",
      "currencyId": "1",
  }
 
  this.service.getTrips(data).subscribe((res)=>{
   this.buses = res.data;
  this.loading=true;
  })

  }

  getSeats(item){
    this.bus=item;
    this.returnService.toggleBusDetail(item);
  
  }

  tooltip(item,bus){
    if(item.seat_type =='normal' || item.seat_type =='bclass' || item.seat_type =='vip'){
      let obj=bus.defaultTripPriceList.find(ob=>ob.seatType == item.seat_type)
      return item.seat_name+'| '+item.seat_type.charAt(0).toUpperCase() + item.seat_type.slice(1) +'|'+obj.currencyCode +' '+obj.amount
    }else{
      return item.seat_name+'| '+ item.seat_type.charAt(0).toUpperCase() + item.seat_type.slice(1) 
    }
   
  }

selectSeat(item){
    if(this.reviewInfo.hasOwnProperty('returnticket') && Object.keys(this.reviewInfo.returnticket).length !=0  && this.reviewInfo.returnticket.passenger.length !=0){
      if(this.reviewInfo.onwardticket.passenger.length < this.reviewInfo.returnticket.passenger.length ){
                  alert("You can only select "+this.reviewInfo.onwardticket.passenger.length+"  seats")
        }else if(this.reviewInfo.returnticket.passenger.length == this.reviewInfo.onwardticket.passenger.length){
          alert("You can only select "+this.reviewInfo.onwardticket.passenger.length+"  seats")
        }else{
          this.returnService.selectSeat(item);
          this.returnService.saveReturn();
        }
    }else{
      this.returnService.selectSeat(item);
      this.returnService.saveReturn();
    }
}
selectBoarding(item){
this.returnService.changeBoarding(item);
}
selectDropping(item){
  this.returnService.changeDropping(item);
}
save(){
  this.returnService.setBoadingDropping();
  if(this.reviewInfo.returnticket.passenger.length != this.reviewInfo.onwardticket.passenger.length){
    alert("Please  select "+this.reviewInfo.onwardticket.passenger.length+"  seats")
  }else{
    this.reviewModal.show();
  }
}

continueBooking(){
this.reviewModal.hide();
if(this.user !=undefined){
  this.route.navigateByUrl('/passengers')
}else{
  this.commonService.loginModal.next(true);
  this.checkLoginEvent();
}
}
onSubmit(){
  let date = this.searchForm.get('returnDate').value
  this.params.return_date = this.datePipe.transform(date,'yyyy-MM-dd')
  let data = this.params
  this.route.navigate(['buslist',data.destination_city_id,data.source_city_id,this.datePipe.transform(data.travel_date,'yyyy-MM-dd'),data.dest_city,data.source_city,this.datePipe.transform(date,'yyyy-MM-dd')])
}

checkLoginEvent(){
  this.commonService.auth.subscribe((res)=>{
     if(res){
       this.route.navigateByUrl('/passengers')
     }
   })
}
}
