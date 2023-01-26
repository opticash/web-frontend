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
    submitted: boolean = false;
    invalidAddress: boolean = false;
    hardcapPercentage: number = 0;
    constructor(
        private userServce: UserService,
        private web3Service:Web3Service
    ) { }

    ngOnInit(): void {
        this.getData();
        this.isWalletCreated = this.web3Service.getIsWalletConnected();
        this.web3Service.walletAddress$.subscribe(x => {
            this.isWalletCreated = true;
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

}
