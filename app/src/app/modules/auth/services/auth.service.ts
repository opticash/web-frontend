import { Injectable } from '@angular/core';
import { ApiConstants } from 'app/constants/api.constants';
import { BaseService } from 'app/core/service/base.service';

@Injectable({ providedIn: 'root' })

export class AuthService {
    authToken: string
    ForgotEmailId: string
    constructor(
        private baseService: BaseService,
    ) {
        
    }

    register(data:any) {
        return this.baseService.postRequest(ApiConstants.REGISTER,data);
    }

    login(data:any) {
        return this.baseService.postRequest(ApiConstants.LOGIN,data);
    }

    forgot_password(data:any) {
        return this.baseService.postRequest(ApiConstants.FORGOTPASSWD,data);
    }

    reset_password(data:any) {
        return this.baseService.postRequest(ApiConstants.RESETPASSWD,data);
    }

    verify_user(data:any) {
        return this.baseService.postRequest(ApiConstants.VERIFY_USER,data);
    }

    resend_otp(data:any) {
        return this.baseService.postRequest(ApiConstants.RESEND_OTP,data);
    }

    setAuthToken(token:any){
        this.authToken = token;
    }
    
    getAuthToken(){
        return this.authToken;
    }
    
    setForgotEmail(email:string){
        this.ForgotEmailId = email;
    }
    getForgotEmail(){
        return this.ForgotEmailId;
    }

}