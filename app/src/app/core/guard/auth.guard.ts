import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    public authenticationService: AuthenticationService,
    public router: Router
  ) {}
  canActivate(): boolean {
    if (!this.authenticationService.islogin()) {
      this.router.navigate(['auth/sign-in']);
      return false;
    }
    return true;
  }
}
