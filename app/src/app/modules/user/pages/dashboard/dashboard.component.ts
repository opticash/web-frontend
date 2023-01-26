import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/core/service/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import Web3 from 'web3';
import { Web3Service } from '../../services/web3.service';
const web3 = new Web3();
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    pageData: any;
    isWalletCreated: boolean = false;
    wrongNetwork: boolean = false;
    submitted: boolean = false;
    invalidAddress: boolean = false;
    hardcapPercentage: number = 0;
    date:Date = new Date();
    userData: any;
    constructor(
        private userServce: UserService,
        private web3Service:Web3Service,
        private authService: AuthenticationService
    ) { }

    ngOnInit(): void {
        this.getData();
        this.userData = this.authService.getUserData();
        this.isWalletCreated = this.web3Service.getIsWalletConnected();
        this.wrongNetwork = this.web3Service.wrongNetwork;
        this.web3Service.walletAddress$.subscribe(x => {
            this.isWalletCreated = true;
        });
        this.web3Service.accountStatus$.subscribe(x => {
            this.wrongNetwork = x;
        });
    }

    getData(){
        this.userServce.dashboard({}).subscribe(resp =>{
            if(resp.type === true){
                this.pageData = resp.data;
                this.hardcapPercentage = (Number(this.pageData.total_raised)/Number(this.pageData.hardcap)) * 100
                console.log(this.hardcapPercentage);
            }
        });
    }

    connectWalletAction(){
        this.web3Service.connectWalletAction();
    }

    changeNetwork(){
        this.web3Service.switchToBinance();
    }

}
