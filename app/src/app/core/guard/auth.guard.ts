import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    public authenticationService: AuthenticationService,
    public router: Router
  ) {
    
  }
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authenticationService.islogin()) {
      this.router.navigate(['auth/sign-in'],{queryParams:{'redirectURL':state.url}});
      return false;
    }
    return true;
  }
}
