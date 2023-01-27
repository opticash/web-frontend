import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { config} from 'app/constants/config';
import { SpinnerService } from 'app/shared/services/spinner.service';
import { AbiPC, AbiTB } from 'app/constants/abi';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { BaseWeb3Class } from '../../base-web3.component';
import { Web3Service } from '../../services/web3.service';

@Component({
    selector: 'app-deposit',
    templateUrl: './deposit.component.html',
    styleUrls: ['./deposit.component.scss']
})
export class DepositComponent extends BaseWeb3Class implements OnInit {
    
    form: FormGroup;
    submitted: boolean = false;
    isButtonClicked: boolean = false;
    waitingTxShow: string = '';
    currencyType:string = 'ETH';
    timeValueReconnect: any = 0;
    opchValue: number = 0;
    usdValue: number = 0;
    amountUpdate = new Subject<any>();
    isUSDTApprove: boolean = false;
    isUSDTConfirm: boolean = false;
    transactionHash: string;
    paymentId:string;
    isSendEth: boolean = false;

    @Input() isSelector: boolean;
    constructor(
        private toastrService:ToastrService,
        private spinner: SpinnerService,
        private userServce: UserService,
        private router: Router,
        web3Service: Web3Service,
    ) { 
        super(web3Service)
    }

    ngOnInit(): void {
        this.bindWeb3Service();
        this.form = new FormGroup({
            currency: new FormControl(this.currencyType, [Validators.required]),
            amount: new FormControl('',[Validators.required, Validators.pattern(/^\d*(?:[.,]\d{1,6})?$/), Validators.maxLength(20)]),
        });
        this.submitted = false;

        this.amountUpdate.pipe(debounceTime(400), distinctUntilChanged()).subscribe(value => {
            this.updateOpchValue()
        });
    }

    isApprovedUSDT = async() => {
        this.timeValueReconnect = this.timeValueReconnect + 1
        if (this.timeValueReconnect === 1) {
            try {
                setTimeout(() => {
                    this.timeValueReconnect = 0
                }, 1500)
                let addrr =  this.walletAddress;
                const myContractInstance = new this.web3js.eth.Contract(AbiTB, config.USDTContractAddress);
                await myContractInstance.methods.allowance(addrr,config.PaymentContractAddress).call().then((res: any, error: any) => {
                    if (error) {
                        console.log("balance error ", error)
                    } else {
                        this.showConfirmModal();
                        console.log(res);
                        const allowanceUSDT = this.web3Service.getValidValue(res);
                        if (allowanceUSDT < this.form.value.amount) {
                            this.isUSDTApprove = true;
                            this.isUSDTConfirm = false;
                            // enable approve button and disable confirm button
                            // this.getApprovalUSDT();
                        } else {
                            this.isUSDTApprove = false;
                            this.isUSDTConfirm = true;
                            // disable approve button and enable confirm button
                            
                        }
                    }
                })
            } catch (err) {
                console.log("err ", err)
                this.timeValueReconnect = 0
                console.log("errror ", err)
            }
        }
    }

    getApprovalUSDT = async() => {
        this.spinner.show();
        console.log(2);
        const addr = this.walletAddress;
        const myContractInstance = new this.web3js.eth.Contract(AbiTB, config.USDTContractAddress);
        await myContractInstance.methods.approve(config.PaymentContractAddress,"10000000000000000000000000").send({ from: addr }, (err:any, res:any ) => {
            if (res) {
                console.log('get Approval USDT', res);
                this.listenApprovedEvent();
            } else {
                this.spinner.hide();
                this.toastrService.error(err.message)
            }
        });
    }

    listenApprovedEvent() {
        return new Promise(resolve => {
        const myContractInstance = new this.web3js.eth.Contract(AbiTB, config.USDTContractAddress);
        myContractInstance.events.Approval({}, (error:any, result:any) => {
            try {
                if (result) {
                    // disable approve button and enable confirm button
                    this.isUSDTApprove = false;
                    this.isUSDTConfirm = true;
                    console.log("listen Approved Event =>", result);
                    this.toastrService.success("Approval Successfull");
                    this.spinner.hide();
                } else {
                    this.spinner.hide();
                    console.error("listenRegisterEvent error", error)
                }
            } catch (error) {
                this.spinner.hide();
                this.toastrService.error("Request Failed!");
                console.log("Error Coming ", error)
            }
          });
        });
    }

    listenUSDTTransferEvent() {
        return new Promise(resolve => {
        const myContractInstance = new this.web3js.eth.Contract(AbiPC, config.PaymentContractAddress);
        myContractInstance.events.DepositUSDT({}, (error:any, result:any) => {
            console.log("listen Transfer Event, ", result);
            this.waitingTxShow = '';
            try {
                if (result) {
                    // disable approve button and enable confirm button
                    this.confirmTx();
                } else {
                    this.waitingTxShow = '';
                    console.error("listenRegisterEvent error", error)
                }
            } catch (error) {
                this.toastrService.error("Request Failed!");
                console.log("Error Coming ", error)
            }
            
          });
        });
    }

    sendUSDT = async() => {
        const addr = this.walletAddress;
        const myContractInstance = new this.web3js.eth.Contract(AbiPC, config.PaymentContractAddress);
        this.spinner.show();
        await myContractInstance.methods.depositUSDT(this.web3js.utils.toWei(this.form.value.amount, "ether")).send({ from: addr}, (err:any, res:any ) => {
            this.spinner.hide();
            this.hideConfirmModal();
            try {
                if (res) {
                    this.waitingTxShow = 'show';
                    this.listenUSDTTransferEvent();
                    console.log('depositUSDT', res);
                    this.transactionHash = res;
                    this.updateTx();
                } else {
                    this.toastrService.error(err.message)
                }
            } catch (error) {
                this.toastrService.error("Request Failed!");
                console.log("Error Coming ", error)
            }
            
        });
    }

    sendETH = async() => {
        const addr = this.walletAddress;
        const myContractInstance = new this.web3js.eth.Contract(AbiPC, config.PaymentContractAddress);
        this.spinner.show();
        await myContractInstance.methods.depositETH().send({ from: addr, value: this.web3js.utils.toWei(this.form.value.amount, "ether") }, (err:any, res:any ) => {
            this.spinner.hide();
            this.hideConfirmModal();
            if (res) {
                this.waitingTxShow = 'show';
                this.listenETHTransferEvent()
                console.log('depositETH', res);
                this.transactionHash = res;
                this.updateTx();
            } else {
                this.toastrService.error(err.message)
            }
        });
    }

    listenETHTransferEvent() {
        return new Promise(resolve => {
        const myContractInstance = new this.web3js.eth.Contract(AbiPC, config.PaymentContractAddress);
        myContractInstance.events.DepositETH({}, (error:any, result:any) => {
            console.log("listen Transfer Event, ", result);
            this.waitingTxShow = '';
            if (!error) {
                try {
                    // disable approve button and enable confirm button
                    this.confirmTx();
                } catch (error) {
                    this.toastrService.error("Request Failed!");
                    console.log("Error Coming ", error);
                }
            }
            else {
                this.waitingTxShow = '';
                console.error("listenRegisterEvent error", error)
            }
          });
        });
    }

    get f(): { [key: string]: AbstractControl } {
        return this.form.controls;
    }

    onSubmit(){
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }
        this.savePayment();
    }

    updateOpchValue(){
        this.opchValue = 0;
        if(!this.form.value.amount.match(/^\d*(?:[.,]\d{1,6})?$/)) return;
        if(this.form.value.currency === 'USDT' || this.form.value.currency === 'CARD'){
            this.opchValue = this.form.value.amount * 10;
        } else if(this.form.value.currency === 'ETH'){
            this.getEthValue();
        }
    }

    getEthValue(){
        this.userServce.getEthValue().subscribe(data => {
            this.usdValue = Number(data.USD);
            const value = Number(data.USD) * Number(this.form.value.amount);
            this.opchValue = Number(parseFloat(value.toString()).toFixed(2));
        });
    }

    savePayment(){
        var obj = {
            walletAddress:this.walletAddress,
            amount:this.form.value.amount,
            currency:this.form.value.currency,
            usdValue: this.form.value.currency === 'ETH' ? (this.usdValue * this.form.value.amount) : this.form.value.amount,
        }
        this.isButtonClicked = true;

        this.userServce.savePayment(obj).subscribe({
            next: (data:any) => {
                this.isButtonClicked = false;
                if(data.type === true){
                    this.paymentId = data.id; 
                    if(this.form.value.currency === 'ETH' || this.form.value.currency === 'USDT'){
                        this.isApprovedUSDT();
                    } else {
                        this.isSendEth = true;
                    }
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

    updateTx(){
        var obj = {
            id:this.paymentId,
            txhash:this.transactionHash,
        };
        this.userServce.updateTx(obj).subscribe({
            next: (data) => {
                console.log('updateTx => ',data);
            },
            error: (error) => {
                console.error(error);
            }
        });
    }

    confirmTx(){
        var obj = {
            id:this.paymentId,
            txhash:this.transactionHash,
        };
        this.toastrService.success("Transfer Successfully");
        this.userServce.confirmTx(obj).subscribe({
            next: (data) => {
                console.log('confirm Tx =>',data);
                this.router.navigate(['transactions']);
            },
            error: (error) => {
                console.error(error);
            }
        });
    }

    showForm(){
        this.submitted = false;
        this.isSendEth = false;
    }

    resetValues(){
        this.form.controls['amount'].setValue('');
        this.amountUpdate.next(0);
    }

}
