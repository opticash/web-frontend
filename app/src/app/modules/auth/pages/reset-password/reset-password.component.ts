import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Validation from 'app/shared/utils/validation';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import {Md5} from 'ts-md5';

    @Component({
        selector: 'app-reset-password',
        templateUrl: './reset-password.component.html',
        styleUrls: ['./reset-password.component.scss']
    })
    export class ResetPasswordComponent implements OnInit {
    form: FormGroup;
    submitted: boolean = false;
    isButtonClicked: boolean = false;
    counter:number;
    constructor(
        private authService:AuthService,
        private toastrService:ToastrService,
        private router: Router,
    ) { this.startCountdown(30); }

    ngOnInit(): void {
        if(!this.authService.getAuthToken()){
            this.router.navigate(['auth/forgot-password']);
        }
        this.form = new FormGroup({
            otp: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(100),]),
            passwd1: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
            passwd2: new FormControl('', Validators.required),
        },
        {
            validators: [Validation.match('passwd1', 'passwd2')]
        });
        this.submitted = false;
        
    }

    onSubmit() {
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }
        this.isButtonClicked = true;
        this.form.value.passwd1 = Md5.hashStr(this.form.value.passwd1);
        this.form.value.passwd2 = Md5.hashStr(this.form.value.passwd2);
        this.authService.reset_password(this.form.value).subscribe((data)=>{
            this.isButtonClicked = false;
            if(data.type === true){
                this.authService.setAuthToken(undefined);
                this.router.navigate(['auth/sign-in']);
                this.toastrService.success('Password has been reset successfully.');
            } else if(data.type === 'error'){
                this.toastrService.error(data.message);
            }
        });
    }

    resend(){
        const obj = {email:this.authService.getForgotEmail()} 
        this.authService.forgot_password(obj).subscribe((data)=>{
            this.isButtonClicked = false;
            if(data.type === true){
                this.startCountdown(30);
                this.authService.setAuthToken(data.auth);
                this.toastrService.success(data.message);
            } else if(data.type === 'error'){
                this.toastrService.error(data.message);
            }
        });
    }

    get f(): { [key: string]: AbstractControl } {
        return this.form.controls;
    }

    startCountdown(seconds:number) {
        this.counter = seconds;
        const interval = setInterval(() => {
          this.counter--;
          if (this.counter < 0 ) {
            clearInterval(interval);
          }
        }, 1000);
    }

}
