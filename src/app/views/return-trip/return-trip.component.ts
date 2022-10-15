import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ServiceService } from 'src/app/services/service.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { BookingService } from 'src/app/services/booking.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-return-trip',
  templateUrl: './return-trip.component.html',
  styleUrls: ['./return-trip.component.scss']
})
export class ReturnTripComponent implements OnInit {
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
  addressForm: FormGroup;
  selectedData={}
  reviewInfo:any={};
  disabled='return';
  active='onward'
  @ViewChild('reviewModal', { static: false }) reviewModal?: ModalDirective;

  constructor(public service:ServiceService,public activated:ActivatedRoute,private formBuilder: FormBuilder,public bookingService:BookingService,public commonService:CommonService) { }
  ngOnInit() {
    this.commonService.review_info.subscribe((res)=>{
     this.reviewInfo=res;
    })
    this.bookingService.selectedseatdata.subscribe((res)=>{
      this.selectedData=res
    })
    this.bookingService.selected_seats.subscribe((res)=>{
      this.seats=res;
    })
    this.bookingService.total.subscribe((res)=>{
      this.total=res;
    })
    this.bookingService.bording_points.subscribe((res)=>{
      this.boarding_points=res;
    })
    this.bookingService.dropping_points.subscribe((res)=>{
      this.dropping_points=res;
    })
    this.bookingService.seats.subscribe((res)=>{
      this.seatList=res
    })
    this.bookingService.trip_data.subscribe((res)=>{
      this.selectedTripData=res;
    })
    this.addressForm = this.formBuilder.group({
      boarding_point:['', Validators.required],
      dropping_point:['', Validators.required]
    });
   this.activated.paramMap.subscribe((res)=>{  
    this.params.source_city_id=res.get('id1')
    this.params.destination_city_id=res.get('id2')
    this.params.travel_date =res.get('id3')
    this.params.source_city=res.get('id4');
    this.params.dest_city=res.get('id5');
    this.bookingService.setBookingParams(this.params)
    let data= {
      "source_city_id":res.get('id1'),
      "destination_city_id":res.get('id2'),
      "travel_date":res.get('id3'),
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
      "token": "FA992334-76E3-44AD-BB4E-062FD0266D71"
  }
  this.service.getTrips(data).subscribe((res)=>{
   this.buses = res.data;
  })
   })
  }

  getSeats(item){
    this.bus=item;
    this.bookingService.toggleBusDetail(item);
  
  }
  getBoardingDroping(item,index){
    let data={
      "source":this.params.source_city_id,
      "destination":this.params.destination_city_id,
      "booking_date":this.params.travel_date,
      "trip":item.bus_id,
      "delayedFlag": 0,
      "delayedDate":item.delayedDate,
      "token": "FA992334-76E3-44AD-BB4E-062FD0266D71"
  }
  this.service.getBoardingDroping(data).subscribe((res)=>{
      this.buses[index].dropping = res.dropping
      this.buses[index].boarding = res.boarding

  })
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
   this.bookingService.selectSeat(item);
}
selectBoarding(item){
this.bookingService.changeBoarding(item);
}
selectDropping(item){
  this.bookingService.changeDropping(item);
}
save(){
  this.bookingService.saveOutward();
  this.active='return'
  this.disabled='onward'
}



}
