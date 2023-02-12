import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
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
    timeValueReconnect: any = 0;
    opchValue: number = 0;
    usdValue: number = 0;
    amountUpdate = new Subject<any>();
    isUSDTApprove: boolean = false;
    isUSDTConfirm: boolean = false;
    transactionHash: string;
    paymentId:string;
    isSendEth: boolean = false;
    isTxComaplete: boolean = false;
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
            currency: new FormControl(this.networkType, [Validators.required]),
            amount: new FormControl('',[Validators.required, Validators.pattern(/^\d*(?:[.,]\d{1,6})?$/), Validators.maxLength(20)]),
        });
        this.submitted = false;
        this.web3Service.walletAddress$.subscribe(x => {
            this.form.controls['currency'].setValue(this.networkType);
        });    
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
                const myContractInstance = new this.web3js.eth.Contract(AbiTB, this.configToken[this.web3Network].USDTContractAddress);
                await myContractInstance.methods.allowance(addrr,this.configToken[this.web3Network].PaymentContractAddress).call().then((res: any, error: any) => {
                    if (error) {
                        console.log("balance error ", error)
                    } else {
                        this.showConfirmModal();
                        console.log('isApprovedUSDT =>',res);
                        const allowanceUSDT = this.web3Service.getValidValue(res);
                        if (Number(allowanceUSDT) < Number(this.form.value.amount)) {
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
                this.timeValueReconnect = 0
                console.log("errror ", err)
            }
        }
    }

    getApprovalUSDT = async() => {
        this.spinner.show();
        console.log(2);
        const addr = this.walletAddress;
        const myContractInstance = new this.web3js.eth.Contract(AbiTB, this.configToken[this.web3Network].USDTContractAddress);
        await myContractInstance.methods.approve(this.configToken[this.web3Network].PaymentContractAddress,"10000000000000000000000000").send({ from: addr }, (err:any, res:any ) => {
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
        const myContractInstance = new this.web3js.eth.Contract(AbiTB, this.configToken[this.web3Network].USDTContractAddress);
        this.isTxComaplete = false;
        this.checkTxComaplete('listenApprovedEvent')
        myContractInstance.events.Approval({}, (error:any, result:any) => {
            try {
                if (result) {
                    // disable approve button and enable confirm button
                    this.isUSDTApprove = false;
                    this.isUSDTConfirm = true;
                    console.log("listen Approved Event =>", result);
                    this.toastrService.success("Approval Successfull");
                } else {
                    console.error("listenRegisterEvent error", error)
                }
                this.isTxComaplete = false;
                this.spinner.hide();
            } catch (error) {
                this.isTxComaplete = false;
                this.spinner.hide();
                this.toastrService.error("Request Failed!");
                console.log("Error Coming ", error)
            }
          });
        });
    }

    listenUSDTTransferEvent() {
        return new Promise(resolve => {
        const myContractInstance = new this.web3js.eth.Contract(AbiPC, this.configToken[this.web3Network].PaymentContractAddress);
        this.isTxComaplete = false;
        this.checkTxComaplete('listenUSDTTransferEvent')
        myContractInstance.events.BuyOPCHfromUSDT({}, (error:any, result:any) => {
            console.log("listen Transfer Event, ", result);
            try {
                if (result) {
                    // disable approve button and enable confirm button
                    this.confirmTx();
                } else {
                    console.error("listenRegisterEvent error", error)
                }
                this.waitingTxShow = '';
                this.isTxComaplete = true;
            } catch (error) {
                this.waitingTxShow = '';
                this.isTxComaplete = true;
                this.toastrService.error("Request Failed!");
                console.log("Error Coming ", error)
            }
            
          });
        });
    }

    sendUSDT = async() => {
        const addr = this.walletAddress;
        const myContractInstance = new this.web3js.eth.Contract(AbiPC, this.configToken[this.web3Network].PaymentContractAddress);
        this.spinner.show();
        let decimal = 'ether'
        if(this.networkType==='ETH' || this.networkType==='MATIC'){
            decimal = 'mwei'
        }
        await myContractInstance.methods.buyOPCHfromUSDT(this.web3js.utils.toWei(this.form.value.amount, decimal)).send({ from: addr}, (err:any, res:any ) => {
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
        const myContractInstance = new this.web3js.eth.Contract(AbiPC, this.configToken[this.web3Network].PaymentContractAddress);
        this.spinner.show();
        await myContractInstance.methods.buyOPCH().send({ from: addr, value: this.web3js.utils.toWei(this.form.value.amount, "ether") }, (err:any, res:any ) => {
            this.spinner.hide();
            this.hideConfirmModal();
            if (res) {
                this.waitingTxShow = 'show';
                this.listenETHTransferEvent();
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
        const myContractInstance = new this.web3js.eth.Contract(AbiPC, this.configToken[this.web3Network].PaymentContractAddress);
        this.isTxComaplete = false;
        this.checkTxComaplete('listenETHTransferEvent');
        myContractInstance.events.BuyOPCH({}, (error:any, result:any) => {
            console.log("listen Transfer Event, ", result);
                try {
                    if (!error) {
                        // disable approve button and enable confirm button
                        this.confirmTx();
                    } else {
                        console.error("listenRegisterEvent error", error)
                    }
                    this.waitingTxShow = '';
                    this.isTxComaplete = true;
                } catch (error) {
                    this.waitingTxShow = '';
                    this.toastrService.error("Request Failed!");
                    console.log("Error Coming ", error);
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
        // if(this.opchValue >= 50){
        // } else {
        //     this.toastrService.error('Minimum OPCH token purchase value is 5$.')
        // }
    }

    updateOpchValue(){
        this.opchValue = 0;
        if(!this.form.value.amount.match(/^\d*(?:[.,]\d{1,6})?$/)) return;
        if(this.form.value.currency === 'USDT' || this.form.value.currency === 'CARD'){
            this.opchValue = this.form.value.amount * 10;
        } else if(this.form.value.currency === this.networkType){
            this.getEthValue();
        }
    }

    getEthValue(){
        this.userServce.getEthValue(this.networkType).subscribe(data => {
            this.usdValue = Number(data.USD);
            const value = Number(data.USD) * Number(this.form.value.amount) * 10;
            this.opchValue = Number(parseFloat(value.toString()).toFixed(2));
        });
    }

    savePayment(){
        var obj = {
            walletAddress:this.walletAddress,
            amount:this.form.value.amount,
            currency:this.form.value.currency,
            chain:this.networkType,
            usdValue: this.form.value.currency === this.networkType ? (this.usdValue * this.form.value.amount) : this.form.value.amount,
        }
        this.isButtonClicked = true;

        this.userServce.savePayment(obj).subscribe({
            next: (data:any) => {
                this.isButtonClicked = false;
                if(data.type === true){
                    this.paymentId = data.id; 
                    if(this.form.value.currency === 'USDT'){
                        this.isApprovedUSDT();
                    } else if(this.form.value.currency === this.networkType){
                        this.showConfirmModal();
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

    checkTxComaplete(type:string){
        setTimeout(() => {
            if(!this.isTxComaplete){
                this.toastrService.info('The transaction is taking too long to confirm on blockchain, please check back after sometime.')
                switch (type) {
                    case 'listenApprovedEvent':
                        this.isUSDTApprove = false;
                        this.isUSDTConfirm = true;
                        this.spinner.hide();
                        break;
                    case 'listenUSDTTransferEvent':
                        this.confirmTx();
                        this.waitingTxShow = '';
                        break;
                    case 'listenETHTransferEvent':
                        this.confirmTx();
                        this.waitingTxShow = '';
                        break;
                    default:
                        break;
                }
            }
        }, 30000);
    }

}
