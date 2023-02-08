import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'app/core/service/authentication.service';
import { BaseWeb3Class } from 'app/modules/user/base-web3.component';
import { UserService } from 'app/modules/user/services/user.service';
import { Web3Service } from 'app/modules/user/services/web3.service';

@Component({
    selector: 'app-user-layout',
    templateUrl: './user-layout.component.html',
    styleUrls: ['./user-layout.component.scss'],
})
export class UserLayoutComponent extends BaseWeb3Class implements OnInit {
    userData:any;
    isCollapsed:boolean = true;
    disconnect: boolean = false;
    notificationPop: boolean = false;
    date:Date;
    notificationsData:any;
    notificationsNewcount:number;
    
    constructor(
        private authenticationService:AuthenticationService,
        private router: Router, 
        private userService: UserService,
        web3Service: Web3Service,
    ) {
        super(web3Service)
    }

    ngOnInit(): void {
        this.date = new Date();
        this.userData = this.authenticationService.getUserData();
        this.web3Service.walletAddress$.subscribe(x => {
            this.walletAddress = x;
            console.log('walletAddress', this.walletAddress);
        });
        this.web3Service.accountStatus$.subscribe(x => {
            this.wrongNetwork = x;
        });
        this.getNotificationData();
    }

    getValidValue(valu:any) {
        if (valu > 0) {
          let usrBal = this.web3js.utils.fromWei(valu, 'ether')
          return Number(usrBal).toFixed(2)
        }
        return valu
    }

    logout(){
        this.web3Service.logoutWallet();
        this.authenticationService.logout();
        this.router.navigate(['auth/sign-in']);
        window.location.reload();
    }

    hideMenu(){
        this.isCollapsed = true;
    }

    getNotificationData(){
        this.userService.getNotifications().subscribe(resp => {
            if(resp.type){
                this.notificationsData = resp.data;
                this.notificationsNewcount = resp.newcount;
            }
        })
    }
    updateNotification(id?:number){
        let data;
        if(id){
            data = {not_id:id}
        }
        this.userService.updateNotifications(data).subscribe(resp => {
        })
    }

    showNotification(){
        this.notificationPop = !this.notificationPop;
        if(this.notificationsNewcount > 0 && !this.notificationPop){
            this.updateNotification();
            this.notificationsNewcount = 0;
        }
    }
}