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


    shareInvitation(type:string){
        const text = encodeURIComponent('You can purchase OPCH tokens now on the Buy and home page. You can get a quick response to any questions and chat with the project in our Telegram: https://t.me/opticash_io or email info@opticash.io');
        let url = '';
        if(type === 'twitter'){
            url = 'https://twitter.com/intent/tweet?text='+text;
        } else if (type === 'whatsapp'){
            url = 'https://api.whatsapp.com/send?text='+text;
        } else if (type === 'instagram'){
            url = 'https://instagram.com/accounts/login/?text='+text;
        } else if(type === 'telegram'){
            url = 'https://t.me/share/url?url=https://opticash.io/&text='+text;
        }
        window.open(url,'_blank','location=yes,height=500,width=620,scrollbars=yes,status=yes');
    }

}
