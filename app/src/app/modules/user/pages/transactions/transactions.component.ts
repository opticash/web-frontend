import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit, AfterViewInit {
    pageData: any;
    constructor(
        private userServce: UserService,
    ) { }

    ngOnInit(): void {
    }

    ngAfterViewInit() {
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
