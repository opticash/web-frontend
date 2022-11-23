import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'app/core/service/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

    @Component({
        selector: 'app-forgot-password',
        templateUrl: './forgot-password.component.html',
        styleUrls: ['./forgot-password.component.scss']
    })
    export class ForgotPasswordComponent implements OnInit {
    form: FormGroup;
    submitted: boolean = false;
    isButtonClicked: boolean = false;
    isForgotPassword: boolean = true;

    constructor(
        private authService:AuthService,
        private toastrService:ToastrService,
    ) { }

    ngOnInit(): void {
        this.form = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(100),]),
        });
        this.submitted = false;
    }

    onSubmit() {
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }
        this.isButtonClicked = true;
        this.authService.forgot_password(this.form.value).subscribe((data)=>{
            this.isButtonClicked = false;
            if(data.type === true){
                this.authService.setAuthToken(data.auth);
                this.authService.setForgotEmail(this.form.value.email);
                this.toastrService.success(data.message);
                this.isForgotPassword = false;
            } else if(data.type === 'error'){
                this.toastrService.error(data.message);
            }
        });
    }

    get f(): { [key: string]: AbstractControl } {
        return this.form.controls;
    }

}
