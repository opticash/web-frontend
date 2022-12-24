import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'app/core/service/authentication.service';
import { Web3Service } from 'app/modules/user/services/web3.service';



@Component({
    selector: 'app-user-layout',
    templateUrl: './user-layout.component.html',
    styleUrls: ['./user-layout.component.scss'],
})
export class UserLayoutComponent implements OnInit {
    web3js: any;
    userData:any;
    isCollapsed:boolean = true;
    wallet: any = null;
    onboard: any = null;
    walletAddress: string = ''
    wrongNetwork: boolean = false;
    
    constructor(
        private authenticationService:AuthenticationService,
        private router: Router, 
        private web3Service:Web3Service,
    ) {
      
    }

    ngOnInit(): void {
        this.userData = this.authenticationService.getUserData();
        this.web3Service.walletAddress$.subscribe(x => {
            console.log(x);
            this.walletAddress = x;
            console.log('walletAddress', this.walletAddress);
        });
        this.web3Service.accountStatus$.subscribe(x => {
            this.wrongNetwork = x;
        });
    }

    getValidValue(valu:any) {
        if (valu > 0) {
          let usrBal = this.web3js.utils.fromWei(valu, 'ether')
          return Number(usrBal).toFixed(2)
        }
        return valu
    }

    connectWalletAction(){
      this.web3Service.connectWalletAction();
    }

    changeNetwork(){
        this.web3Service.switchToBinance();
    }    

    logout(){
        this.web3Service.logoutWallet();
        this.authenticationService.logout();
        this.router.navigate(['auth/sign-in']);
    }

    hideMenu(){
        this.isCollapsed = true;
    }

}