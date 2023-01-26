import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Web3Service } from 'app/modules/user/services/web3.service';
import { config} from 'app/constants/config';
import { SpinnerService } from 'app/shared/services/spinner.service';
import { Abi, AbiPC, AbiTB } from 'app/constants/abi';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import Web3 from "web3";
import Web3Modal from "web3modal";
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-deposit',
    templateUrl: './deposit.component.html',
    styleUrls: ['./deposit.component.scss']
})
export class DepositComponent implements OnInit {
    private web3js: any;
    private provider: any;
    private web3Modal:any;
    public wallet: any = null;
    currentBalance: string;
    allocation: string;
    unlocked: any;
    claimed: string;
    activeToken:string;
    walletAddress: string = ''
    configToken:any = config;
    isWebConnected:boolean = false;
    overlayMsg:string = '';
    wrongNetwork: boolean = false;

    form: FormGroup;
    submitted: boolean = false;
    isButtonClicked: boolean = false;
    confirmModal: string = '';
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
        private web3Service:Web3Service,
        private spinner: SpinnerService,
        private userServce: UserService,
        private router: Router,
    ) { 

    }

    ngOnInit(): void {
        this.wrongNetwork = this.web3Service.wrongNetwork;
        this.walletAddress = this.web3Service.walletAddress;
        this.activeToken = 'Community';
        if(this.walletAddress ){
            this.isWebConnected = true;
            if(!this.wrongNetwork){
                console.log(1);
                console.log('web3Provider =>', this.web3Service.web3Provider);
                this.web3js = new Web3(this.web3Service.web3Provider);
                // this.tokenBalance();
            }
        } else {
            this.isWebConnected = false;
            this.overlayMsg = 'Please connect your wallet.'
        }
        if(this.wrongNetwork){
            this.isWebConnected = true;
            this.overlayMsg = 'Please choose proper blockchain'
        }
        
        this.web3Service.walletAddress$.subscribe(x => {
            this.walletAddress = x;
            this.isWebConnected = true;
            if(!this.wrongNetwork){
                console.log(2);
                console.log('web3Provider =>', this.web3Service.web3Provider);
                this.web3js = new Web3(this.web3Service.web3Provider);
            }
        });
        this.web3Service.accountStatus$.subscribe(x => {
            this.wrongNetwork = x;
            if(this.wrongNetwork){
                this.overlayMsg = 'Please choose proper blockchain'
            } else {
                if(this.walletAddress){
                    console.log(3);
                    // this.tokenBalance();
                }
            }
        });
    
        
        this.form = new FormGroup({
            currency: new FormControl(this.currencyType, [Validators.required]),
            amount: new FormControl('',[Validators.required, Validators.pattern(/^\d*(?:[.,]\d{1,6})?$/), Validators.maxLength(20)]),
        });
        this.submitted = false;

        this.amountUpdate.pipe(
            debounceTime(400),
            distinctUntilChanged())
            .subscribe(value => {
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
                this.toastrService.error(err.message)
            }
        });
    }

    listenApprovedEvent() {
        return new Promise(resolve => {
        const myContractInstance = new this.web3js.eth.Contract(AbiTB, config.USDTContractAddress);
        myContractInstance.events.Approval({}, (error:any, result:any) => {
            if (!error) {
                try {
                    // disable approve button and enable confirm button
                    this.isUSDTApprove = false;
                    this.isUSDTConfirm = true;
                    console.log("listen Approved Event =>", result);
                    this.toastrService.success("Approval Successfull");
                    this.spinner.hide();
                } catch (error) {
                    this.spinner.hide();
                    this.toastrService.error("Request Failed!");
                    console.log("Error Coming ", error)
                }
            }
            else {
                this.spinner.hide();
                console.error("listenRegisterEvent error", error)
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
            if (!error) {
                try {
                    // disable approve button and enable confirm button
                    this.toastrService.success("Transfer Successfully");
                    this.confirmTx();
                } catch (error) {
                    this.toastrService.error("Request Failed!");
                    console.log("Error Coming ", error)
                }
            }
            else {
                this.waitingTxShow = '';
                console.error("listenRegisterEvent error", error)
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
                    this.toastrService.success("Transfer Successfully");
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

    connectWalletAction(){
        this.web3Service.connectWalletAction();
    }

    changeNetwork(){
        this.web3Service.switchToBinance();
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

    showConfirmModal(){
        this.confirmModal = 'show';
    };
    
    hideConfirmModal(){
        this.confirmModal = '';
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
                    console.log(data);
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

}
