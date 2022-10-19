import { Component, HostListener, OnInit } from '@angular/core';
import { ServiceService } from 'src/app/services/service.service';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  payments=[];
  paymentForm: FormGroup;
  user: any={};
  data:any={};
  selected=0;
  seconds=10;
  ref_no='';
  id;
  constructor(public service:ServiceService,private formBuilder: FormBuilder,public commonService:CommonService,public toastr:ToastrService,public spinner:NgxSpinnerService,public activated:ActivatedRoute) { }
  ngOnInit(): void {
    this.activated.paramMap.subscribe((res)=>{
      this.ref_no=res.get('reference');
    })
    this.commonService.review_info.subscribe((res)=>{
      if(Object.keys(res).length != 0){
          localStorage.setItem('transline.paymentDetail',JSON.stringify(res))
      }
    })
    this.data=JSON.parse(localStorage.getItem('transline.paymentDetail'))
    this.user=JSON.parse(sessionStorage.getItem('loggedUser'))
    this.paymentForm = this.formBuilder.group({
      mobile: ['', Validators.required],
      country_code:['', Validators.required]
    });

    if(this.user!=undefined){
      this.paymentForm.patchValue({country_code:this.user.country_code,mobile:this.user.phone})
    }
    this.service.paymentMethods({}).subscribe((res)=>{
      Object.entries(res).forEach(([key, value]) => {
        if(value){
          this.payments.push(key)
        }
      });
    })
   
  }

  makePayment(){
    this.spinner.show();
    let formData=this.paymentForm.value
    let data ={
      "bookingRef": this.ref_no,
      "queryoption":this.data.totalTicketPrice,
      "queryvalue": formData.country_code+''+formData.mobile,
      "requestType": "ticket",
      "isWalletApply": false,
      "additionalInfo": {
        "onward": {"sponsorTrip": false, "discountId": 0},
        "return": {"sponsorTrip": false, "discountId": 0}
      },
    }
    this.service.makePayment(data).subscribe((res)=>{
      this.spinner.hide();
      if(res.isSuccess){
        localStorage.setItem("payment_status",'initiated');
        this.toastr.success("Successfully initiated","Success")
        this.payments.push("Mpesa Confirmation")
        this.selected=1;
        this.timer();
      }
    })
  }
timer(){
  this.id = setInterval(() => {
    --this.seconds
    if(this.seconds < 1){
      clearInterval(this.id);
      this.checkMpesaPayment()
    }
   }, 1000); 
}
setIndex(index){
this.selected=index;
}
checkMpesaPayment(){
  this.spinner.show();
  let formData=this.paymentForm.value
  let data ={
    "bookingRef": this.ref_no,
    "queryoption":this.data.totalTicketPrice,
    "queryvalue": formData.country_code+''+formData.mobile,
    "originalBookingRef": this.ref_no,
    "uuid":this.ref_no,
    "requestType": "ticket",
  }
  this.service.checkMpesaPayment(data).subscribe((res)=>{
    if(res.isSuccess){
      this.spinner.hide()
    }else{
      this.payments.push("Paybill Option");
      this.selected=2;
      this.toastr.error("No Transaction Found","Transaction")
      this.spinner.hide();
    }
  })
}
@HostListener('window:beforeunload', ['$event'])
canLeavePage($event: any): Observable<void> {
  if(confirm('You data is loading. Are you sure you want to leave?')) {
    $event.preventDefault();
    return
  }
}
}
