    import { Component, OnInit } from '@angular/core';
    import { Router } from '@angular/router';
    import { AuthenticationService } from 'app/core/service/authentication.service';

    @Component({
        selector: 'app-user-layout',
        templateUrl: './user-layout.component.html',
        styleUrls: ['./user-layout.component.scss'],
    })
    export class UserLayoutComponent implements OnInit {
        userData:any;
        isCollapsed:boolean = true
    constructor(
        private authenticationService:AuthenticationService,
        private router: Router 
    ) {

    }

    ngOnInit(): void {
        this.userData = this.authenticationService.getUserData();
    }


    logout(){
        this.authenticationService.logout();
        this.router.navigate(['auth/sign-in']);
    }

    hideMenu(){
        this.isCollapsed = true;
    }

}