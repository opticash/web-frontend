import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/core/service/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import Web3 from 'web3';
const web3 = new Web3();
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    pageData: any;
    userData: any;
    isWalletCreated: boolean = false;
    submitted: boolean = false;
    walletAddress: string = '';
    invalidAddress: boolean = false;
    hardcapPercentage: number = 0;
    constructor(
        private userServce: UserService,
        private authenticationService: AuthenticationService,
        private toastrService:ToastrService

    ) { }

    ngOnInit(): void {
        if(this.authenticationService.getUserData()){
            this.userData = this.authenticationService.getUserData();
            if(this.userData && this.userData.wallet_addr){
                this.isWalletCreated = true;
                this.walletAddress = this.userData.wallet_addr;
            }
        }
        this.getData();
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

    updateWalletAddress(){
        this.submitted = true;
        if(this.walletAddress === ''){
            this.invalidAddress = false;
            return
        } else if (!web3.utils.isAddress(this.walletAddress)){
            this.invalidAddress = true;
            return;
        }

        this.userServce.update({walletAddress:this.walletAddress}).subscribe(resp =>{
            if(resp.type === true){
                this.isWalletCreated = true;
                this.userData.wallet_addr = this.walletAddress;
                this.authenticationService.setUserData(this.userData);
                this.toastrService.success(resp.message);
            };
            console.log(resp);
        });
    }

}
