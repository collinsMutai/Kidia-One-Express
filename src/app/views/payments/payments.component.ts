import { Component, OnInit } from '@angular/core';
import { ServiceService } from 'src/app/services/service.service';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  payments=[];
  paymentForm: FormGroup;
  user: any={};
  constructor(public service:ServiceService,private formBuilder: FormBuilder,public commonService:CommonService) { }

  ngOnInit(): void {
    this.commonService.review_info.subscribe((res)=>{
      console.log(res);
    })
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

}
