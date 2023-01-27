import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/core/service/authentication.service';
import { UserService } from '../../services/user.service';
import { Web3Service } from '../../services/web3.service';
import { BaseWeb3Class } from '../../base-web3.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent extends BaseWeb3Class implements OnInit {
    pageData: any;
    submitted: boolean = false;
    invalidAddress: boolean = false;
    hardcapPercentage: number = 0;
    date:Date = new Date();
    userData: any;
    constructor(
        private userServce: UserService,
        web3Service:Web3Service,
        private authService: AuthenticationService
    ) {
        super(web3Service)
     }

    ngOnInit(): void {
        this.bindWeb3Service();
        this.getData();
        this.userData = this.authService.getUserData();
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
