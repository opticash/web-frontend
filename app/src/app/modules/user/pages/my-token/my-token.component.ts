import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Web3 from "web3";
import { Web3Service } from 'app/modules/user/services/web3.service';
import { config} from 'app/constants/config';
import { SpinnerService } from 'app/shared/services/spinner.service';
import { Abi, AbiTB } from 'app/constants/abi';

@Component({
    selector: 'app-my-token',
    templateUrl: './my-token.component.html',
    styleUrls: ['./my-token.component.scss']
})
export class MyTokenComponent implements OnInit {
    web3js: any;
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
    constructor(
        private toastrService:ToastrService,
        private web3Service:Web3Service,
        private spinner: SpinnerService,
    ) { 

    }

    ngOnInit(): void {
        this.wrongNetwork = this.web3Service.wrongNetwork;
        this.walletAddress = this.web3Service.walletAddress;
        this.activeToken = 'Community';
        if(this.walletAddress ){
            this.isWebConnected = true;
            this.web3js = new Web3(this.web3Service.web3Provider);
            console.log('web3Provider',this.web3Service.web3Provider);
            console.log('walletAddress',this.walletAddress);
            if(!this.wrongNetwork){
                console.log(1);
                this.tokenBalance();
                this.getTokenData(this.activeToken);
            }
        } else {
            this.isWebConnected = false;
            this.overlayMsg = 'Please connect your wallet.'
        }
        if(this.wrongNetwork){
            this.isWebConnected = true;
            this.overlayMsg = 'Please choose proper blockchain'
        }
        console.log('isWebConnected', this.isWebConnected);
        console.log('wrongNetwork', this.wrongNetwork);
        
        this.web3Service.walletAddress$.subscribe(x => {
            this.walletAddress = x;
            this.isWebConnected = true;
            this.web3js = new Web3(this.web3Service.web3Provider);
            if(!this.wrongNetwork){
                console.log(2);
                this.tokenBalance();
                this.getTokenData(this.activeToken);
            }
        });
        this.web3Service.accountStatus$.subscribe(x => {
            this.wrongNetwork = x;
            if(this.wrongNetwork){
                this.overlayMsg = 'Please choose proper blockchain'
            } else {
                if(this.walletAddress){
                    console.log(3);
                    this.tokenBalance();
                    this.getTokenData(this.activeToken);
                }
            }
        });
    }

    getTokenData(type:any){
        this.activeToken = type;
        this.spinner.show();
        this.bucketAllocationProcess(this.configToken[this.activeToken]);
    }

    claimAllocationProcess = async() => {
        const addr = this.walletAddress;
        const myContractInstance = new this.web3js.eth.Contract(Abi, this.configToken[this.activeToken]);
        await myContractInstance.methods.ProcessClaim().send({ from: addr }, (err:any, res:any ) => {
            if (res) {
                this.spinner.show();
                console.log('claimAllocationProcess', res);
                this.listenClaimEvent()
            } else {
                this.toastrService.error(err.message)
            }
        });
    }

    listenClaimEvent() {
        return new Promise(resolve => {
        const configToken:any = config;
        const myContractInstance = new this.web3js.eth.Contract(Abi, configToken[this.activeToken]);
        myContractInstance.events.ClaimAllocationEvent({}, (error:any, result:any) => {
            console.log("Hello world, ", result);
            if (!error) {
                try {
                    this.spinner.hide();
                    this.toastrService.success("Claimed Successfully");
                    this.tokenBalance();
                    this.bucketAllocationProcess(configToken[this.activeToken]);
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

    bucketAllocationProcess = async(contractAddr?:any) => {
        let addrr =  this.walletAddress //"0x46ed2A88D9F786EA233d0D783847e0a2502dA101"    
        const myContractInstance = new this.web3js.eth.Contract(Abi, contractAddr);
        await myContractInstance.methods.users(addrr).call((error: any, data: any) => {
            this.spinner.hide();
          if (data) {
            console.log(data);
            this.allocation = this.web3Service.getValidValue(data['0']);
            this.claimed = this.web3Service.getValidValue(data['1']);
          } else {
            console.log(error);
          }
        })
        try {
          await myContractInstance.methods.GetClaimableBalance(addrr).call().then((data: any, error: any) => {
            if (data) {
                this.unlocked = this.web3Service.getValidValue(data);
                console.log("Response Claim data: ", data)
            } else {
                this.unlocked = '0';
                console.log("Response Claim error ", error)
              console.log(error)
            //   eventBus.dispatch('bucketClaimResponse', { data: getValidValue(res) })
            }
          })
        } catch (error) {
            this.unlocked = '0';
            console.log("database wvladas ", error)
        }
    }

    tokenBalance = async () => {
        let addrr = this.walletAddress //"0x46ed2A88D9F786EA233d0D783847e0a2502dA101"
        const myContractInstance = new this.web3js.eth.Contract(AbiTB, config.Token);
        await myContractInstance.methods.balanceOf(addrr).call().then((data: any,error: any) => {
          if (error) {
            console.log(error)
          } else {
              this.currentBalance = this.web3Service.getValidValue(data);
              console.log("Token Response: ", data, );
          }
        })
    }

    connectWalletAction(){
        this.web3Service.connectWalletAction();
    }

    changeNetwork(){
        this.web3Service.switchToBinance();
    } 

}
