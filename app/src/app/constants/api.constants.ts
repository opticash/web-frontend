import { environment } from '../../environments/environment';

export class ApiConstants {
    
    public static get API_URL(): string { return environment.apiUrl; }

    public static get REGISTER() : string { return this.API_URL + 'user/register'}
    public static get LOGIN() : string { return this.API_URL + 'user/login'}
    public static get FORGOTPASSWD() : string { return this.API_URL + 'user/forgot-passwd'}
    public static get RESETPASSWD() : string { return this.API_URL + 'user/reset-passwd'}
    public static get SAVEPAYMENT() : string { return this.API_URL + 'user/savePayment'}
    public static get DASHBOARD() : string { return this.API_URL + 'user/dashboard'}
    public static get UPDATE() : string { return this.API_URL + 'user/update'}
    public static get SUBSCRIBE() : string { return this.API_URL + 'user/subscribe'}

}