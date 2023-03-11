import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements AfterViewInit {
    pageData: any;
    @ViewChild('promocionalModal', { static: false }) promocionalModal?: ModalDirective;
    constructor(
        private userServce: UserService,
        private route: ActivatedRoute
    ) { }

    ngAfterViewInit() {
        this.route.queryParams.subscribe((params:any) => {
            if(params.tx === 'successfully')
            this.promocionalModal?.show();
        });
        this.getData();
    }

    getData(){
        this.userServce.getTransactions({}).subscribe(resp =>{
            if(resp.type === true){
                this.pageData = resp.data;
            }
        });
    }

}
