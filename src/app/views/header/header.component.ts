import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CommonService } from 'src/app/services/common.service';
import { ServiceService } from 'src/app/services/service.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  loginForm: FormGroup;
  type='1'
  codes=['254']
  registerForm: FormGroup;
  authenticated=false;
  @ViewChild('loginModal', { static: false }) loginModal?: ModalDirective;
  constructor(private formBuilder: FormBuilder,public commoService:CommonService,public service:ServiceService,private spinner: NgxSpinnerService,public toastr:ToastrService) {
    if(sessionStorage.getItem('loggedUser')!=undefined){
      this.authenticated = true
    }
   }
  ngOnInit(): void {
    this.commoService.login_modal.subscribe((res)=>{
      if(res){
        this.loginModal.show();
      }
    })
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password:['', Validators.required],
      gcm_token:[''] ,
      country_code:['', Validators.required]
    });
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      password:['', Validators.required],
      phone:['', Validators.required],
      country_code:['', Validators.required]
    });
  }
login(){
  this.spinner.show();
  this.service.login(this.loginForm.value).subscribe((res)=>{
    console.log(res.data)
    if(res.isSuccess){
      this.spinner.hide();
      sessionStorage.setItem("loggedUser",JSON.stringify(res.data));
      this.toastr.success("login successfull",'Success')
      this.loginForm.reset();
      this.loginModal.hide()
    }else{
      this.toastr.error('Incorrect Credentials','Login Failed');
      this.spinner.hide();
    }
  })
}
register(){
console.log('ddddd',this.registerForm.value)
}
}
