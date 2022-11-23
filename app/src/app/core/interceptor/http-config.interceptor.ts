import { Injectable } from '@angular/core';

import {
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SpinnerService } from 'app/shared/services/spinner.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';
import { AuthService } from 'app/modules/auth/services/auth.service';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
    constructor(
        private spinner: SpinnerService,
        private router: Router,
        private authenticationService : AuthenticationService,
        private authService : AuthService,
    ) {
    }
    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let authorization:any = "";
        if(this.authenticationService.getUserAuth()){
            authorization = this.authenticationService.getUserAuth();
        }
        if(request.url.includes('user/reset-passwd') && this.authService.getAuthToken()){
            authorization = this.authService.getAuthToken();
        }
        request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + authorization) });
        this.spinner.show();
        request = request.clone({ reportProgress: true });
        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    if(request.reportProgress){
                        setTimeout(() => {
                            this.spinner.hide();
                        }, 500);
                    }
                }
                return event;
            }),
            catchError((error: HttpErrorResponse) => {
                this.spinner.hide();
                if(error.error.message === 'jwt expired'){
                    this.authenticationService.logout();
                    this.router.navigate(['auth/sign-in']);
                }
                return throwError(error);
            })
        );
    }
}