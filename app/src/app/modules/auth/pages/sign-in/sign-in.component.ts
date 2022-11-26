import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Md5 } from 'ts-md5';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthenticationService } from 'app/core/service/authentication.service';
import { SpinnerService } from 'app/shared/services/spinner.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
    form: FormGroup;
    submitted: boolean = false;
    isButtonClicked: boolean = false;
    constructor(
        private authService:AuthService,
        private authenticationService:AuthenticationService,
        private toastrService:ToastrService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.authenticationService.logout();
        this.form = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(100),]),
            passwd: new FormControl('', [Validators.required]),
        });
        this.submitted = false;
    }

    onSubmit() {
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }
        this.form.value.passwd = Md5.hashStr(this.form.value.passwd);
        this.isButtonClicked = true;
        this.authService.login(this.form.value).subscribe({
            next: (data) => {
                this.isButtonClicked = false;
                if(data.type === true){
                    this.authenticationService.setUserAuth(data.auth);
                    this.authenticationService.setUserData(data.data);
                    if(data.data.is_verified === 'TRUE'){
                        this.router.navigate(['/dashboard']);
                    } else {
                        this.router.navigate(['/auth/verify-email']);
                    }
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

    get f(): { [key: string]: AbstractControl } {
        return this.form.controls;
    }

}
