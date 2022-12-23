import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'app/core/service/authentication.service';
import Web3 from "web3";
import { Web3Service } from 'app/modules/user/services/web3.service';
import { config} from 'app/constants/config';
import { SpinnerService } from 'app/shared/services/spinner.service';

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
    unlocked: string;
    claimed: string;
    activeToken:string;
    constructor(
        private toastrService:ToastrService,
        private web3Service:Web3Service,
        private spinner: SpinnerService,
    ) { 

    }

    ngOnInit(): void {
        this.getTokenData('Community');
    }

    getTokenData(type:any){
        const c:any = config;
        this.activeToken = type; 
        this.tokenBalance();
        this.bucketAllocationProcess(c[type]);
    }

    claimAllocationProcess = async() => {
        let abi = JSON.parse(
            '[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"addr","type":"address"},{"indexed":false,"internalType":"uint256","name":"balance","type":"uint256"}],"name":"ClaimAllocationEvent","type":"event"},{"inputs":[],"name":"ProcessClaim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"allocatedSum","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"GetClaimableBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalMembers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"allocation","type":"uint256"},{"internalType":"uint256","name":"claimed","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"vestingSeconds","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"vestingStartEpoch","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]'
        )
        const addr = this.web3Service.address;
        this.web3js = new Web3(this.web3Service.web3Provider);
        const configToken:any = config;
        const myContractInstance = new this.web3js.eth.Contract(abi, configToken[this.activeToken]);
        await myContractInstance.methods.ProcessClaim().send({ from: addr }, (err:any, res:any ) => {
            if (res) {
                this.spinner.show();
                console.log('claimAllocationProcess', res);
                this.listenClaimEvent()
                //   eventBus.dispatch('claimedStatus', { status: false, msg: "In Progress" })
            } else {
                this.toastrService.error(err.message)
                // eventBus.dispatch('claimedStatus', { status: false, msg: "Blockchain Error", transactionHash: res })
            }
        });
    }

    listenClaimEvent() {
        return new Promise(resolve => {
        let abi = JSON.parse(
            '[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"addr","type":"address"},{"indexed":false,"internalType":"uint256","name":"balance","type":"uint256"}],"name":"ClaimAllocationEvent","type":"event"},{"inputs":[],"name":"ProcessClaim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"allocatedSum","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"GetClaimableBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalMembers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"allocation","type":"uint256"},{"internalType":"uint256","name":"claimed","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"vestingSeconds","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"vestingStartEpoch","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]'
        )
        const addr = this.web3Service.address;
        this.web3js = new Web3(this.web3Service.web3Provider);
        const configToken:any = config;
        const myContractInstance = new this.web3js.eth.Contract(abi, configToken[this.activeToken]);
        myContractInstance.events.ClaimAllocationEvent({}, (error:any, result:any) => {
            console.log("Hello world, ", result);
            if (!error) {
                try {
                    this.spinner.hide();
                    console.log("Hello world, ", result)
                    this.toastrService.success("Claimed Successfully");
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
        let addrr =  this.web3Service.address //"0x46ed2A88D9F786EA233d0D783847e0a2502dA101"    
        let abi = JSON.parse(
            '[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"addr","type":"address"},{"indexed":false,"internalType":"uint256","name":"balance","type":"uint256"}],"name":"ClaimAllocationEvent","type":"event"},{"inputs":[],"name":"ProcessClaim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"allocatedSum","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"GetClaimableBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalMembers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"allocation","type":"uint256"},{"internalType":"uint256","name":"claimed","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"vestingSeconds","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"vestingStartEpoch","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]'
        )
        this.web3js = new Web3(this.web3Service.web3Provider);
        const myContractInstance = new this.web3js.eth.Contract(abi, contractAddr);
        await myContractInstance.methods.users(addrr).call((error: any, data: any) => {
          if (data) {
            console.log("Response: ", data);
            console.log('data.c ',data['0']);
            this.allocation = this.web3Service.getValidValue(data['0']);
            console.log(this.allocation);
            this.claimed = this.web3Service.getValidValue(data['1']);
          } else {
            console.log(error);
             // eventBus.dispatch('bucketResponse', { allocation: getValidValue(res[0]), claimed: getValidValue(res[1]) })
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
        //   eventBus.dispatch('bucketClaimResponse', { data: 0 })
        }
    }

    tokenBalance = async () => {
        let addrr = this.web3Service.address //"0x46ed2A88D9F786EA233d0D783847e0a2502dA101"    
        let abi = JSON.parse(
            '[{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"AdvisersBucketAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"AdvisersLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FoundationBucketAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FoundationLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"LiquidityBucketAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"LiquidityLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MarketingBucketAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MarketingLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PublicSaleLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"StrategicBucketAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"StrategicLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TeamBucketAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TeamLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burnFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"strategicBucketAddress","type":"address"},{"internalType":"address","name":"teamBucketAddress","type":"address"},{"internalType":"address","name":"marketingBucketAddress","type":"address"},{"internalType":"address","name":"advisersBucketAddress","type":"address"},{"internalType":"address","name":"foundationBucketAddress","type":"address"},{"internalType":"address","name":"liquidityBucketAddress","type":"address"}],"name":"setAllocation","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contractIERC20","name":"token","type":"address"}],"name":"unlockERC","outputs":[],"stateMutability":"nonpayable","type":"function"}]'
        )
        this.web3js = new Web3(this.web3Service.web3Provider);
        const myContractInstance = new this.web3js.eth.Contract(abi, config.Token);
        await myContractInstance.methods.balanceOf(addrr).call().then((data: any,error: any) => {
          if (error) {
            // eventBus.dispatch('lepaBalanceEvent', { balanceOf: 0 })
            console.log(error)
          } else {
            console.log("lepa Response: ", data, );
            this.currentBalance = this.web3Service.getValidValue(data);
            // eventBus.dispatch('lepaBalanceEvent', { balanceOf: getValidValue(res) })
          }
        })
    }

}
