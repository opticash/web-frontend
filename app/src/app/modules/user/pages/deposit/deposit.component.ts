import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'app/core/service/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-deposit',
    templateUrl: './deposit.component.html',
    styleUrls: ['./deposit.component.scss']
})
export class DepositComponent implements OnInit {
    form: FormGroup;
    submitted: boolean = false;
    isButtonClicked: boolean = false;
    pageData: any;
    userData: any;
    isSendEth: boolean = false;
    usdValue: number;
    ethAddress:string = '0x4E12c245292648AA9796452078375ebe6c1211eE'
    constructor(
        private userServce: UserService,
        private authenticationService: AuthenticationService,
        private router: Router,
        private toastrService: ToastrService
    ) { }

    ngOnInit(): void {
        let isWalletAddress = false;
        if(this.authenticationService.getUserData()){
            this.userData = this.authenticationService.getUserData();
            if(this.userData && this.userData.wallet_addr){
                isWalletAddress = true;
            }
        }
        if(!isWalletAddress){
            this.router.navigate(['/dashboard']);
        };
        this.form = new FormGroup({
            currency: new FormControl('ETH', [Validators.required]),
            amount: new FormControl('',[Validators.required, Validators.pattern(/^\d*(?:[.,]\d{1,6})?$/), Validators.maxLength(20)]),
        });
        this.submitted = false;
        this.getEthValue();
    }

    onSubmit(){
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }
        this.isButtonClicked = true;
        var obj = {
            walletAddress:this.userData.wallet_addr,
            amount:this.form.value.amount,
            currency:this.form.value.currency,
            usdValue: this.form.value.currency === 'ETH' ? (this.usdValue * this.form.value.amount) : this.form.value.amount,
        }

        this.userServce.savePayment(obj).subscribe({
            next: (data) => {
                this.isButtonClicked = false;
                if(data.type === true){
                    this.isSendEth = true;
                    // this.toastrService.success(data.message);
                    // if(this.form.value.currency === 'ETH'){
                    //     this.getEthValue();
                    // }
                }
            },
            error: (error) => {
                this.isButtonClicked = false;
                console.error(error);
            }
        });
    }

    get f(): { [key: string]: AbstractControl } {
        return this.form.controls;
    }

    showForm(){
        this.submitted = false;
        this.isSendEth = false;
    }

    getEthValue(){
        this.userServce.getEthValue().subscribe(data => {
            this.usdValue = Number(data.USD);
            // this.usdValue = Number(data.USD) * Number(this.form.value.amount);
            // this.usdValue = Number(parseFloat(this.usdValue.toString()).toFixed(2));
        })
    }

    copyMessage(val: string){
        const selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = val;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
        this.toastrService.success('ETH Address Copied!');
      }

}
