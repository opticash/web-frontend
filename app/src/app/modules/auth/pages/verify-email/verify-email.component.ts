import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'app/core/service/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

    @Component({
        selector: 'app-verify-email',
        templateUrl: './verify-email.component.html',
        styleUrls: ['./verify-email.component.scss']
    })
    export class VerifyEmailComponent implements OnInit {
    form: FormGroup;
    submitted: boolean = false;
    isButtonClicked: boolean = false;
    isPrevSignInPage: boolean = false;
    isSignUpCompleted : boolean = false;
    counter:number;
    constructor(
        private authService:AuthService,
        private authenticationService:AuthenticationService,
        private router: Router,
        private toastrService: ToastrService
    ) {
        this.startCountdown(30);
    }

    ngOnInit(): void {
        if(this.authenticationService.getUserData()){
            this.isPrevSignInPage = true;
            this.resend();
        } else {
            if(!this.authService.getAuthToken()){
                this.router.navigate(['auth/sign-in']);
            }
        }
        this.form = new FormGroup({
            otp: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(6),]),
        });
        this.submitted = false;

    }

    onSubmit() {
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }
        console.log('isPrevSignInPage '+this.isPrevSignInPage);
        this.authService.verify_user(this.form.value).subscribe({
            next: (data) => {
                this.isButtonClicked = false;
                if(data.type === true){
                    if(this.isPrevSignInPage){
                        let userData = this.authenticationService.getUserData();
                        userData.is_verified = 'TRUE';
                        this.authenticationService.setUserData(userData);
                        this.authService.redirectUserPage();
                    } else {
                        this.isSignUpCompleted = true;
                    }
                    this.toastrService.success(data.message);
                } else if(data.type === 'error'){
                    this.toastrService.error(data.message);
                }
            },
            error: (error) => {
                this.isButtonClicked = false;
                console.error(error);
            }
        });
    }

    resend(){
        this.authService.resend_otp({}).subscribe((data)=>{
            if(data.type === true){
                this.startCountdown(30);
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
