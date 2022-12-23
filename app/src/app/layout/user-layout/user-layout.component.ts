import { Component, OnInit } from '@angular/core';
import { Router, TitleStrategy } from '@angular/router';
import Onboard from 'bnc-onboard'
import { config } from 'app/constants/config';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'app/core/service/authentication.service';
import Web3 from "web3";
import { Web3Service } from 'app/modules/user/services/web3.service';
declare let window: any;


@Component({
    selector: 'app-user-layout',
    templateUrl: './user-layout.component.html',
    styleUrls: ['./user-layout.component.scss'],
})
export class UserLayoutComponent implements OnInit {
    web3js: any;
    userData:any;
    isCollapsed:boolean = true;
    wallet: any = null;
    onboard: any = null;
    walletAddress: string = ''
    wrongNetwork: boolean = false;
    wallets = [
        { walletName: "metamask", preferred: true },
        {
        walletName: "walletConnect",
        infuraKey: config.onboard.infura_id,
        rpc: {
            ['80001']: 'https://rpc-mumbai.maticvigil.com/',
            ['4']: 'https://goerli.infura.io/v3/' + config.onboard.infura_id
        }
        },
        { walletName: "coinbase", preferred: true },
        { walletName: "trust", preferred: true, rpcUrl: 'https://goerli.infura.io/v3/' + config.onboard.infura_id }
    ];
    constructor(
        private authenticationService:AuthenticationService,
        private router: Router,
        private toastrService:ToastrService,
        private web3Service:Web3Service
    ) {
      this.onboard = Onboard({
          dappId: config.onboard.key,       // [String] The API key created by step one above
          networkId: config.onboard.network,  // [Integer] The Ethereum network ID your Dapp uses.
          darkMode: true,
          blockPollingInterval: 4000,
          walletSelect: { wallets: this.wallets },
          subscriptions: {
            address: address => {
              if (this.wallet.provider !== undefined) {
                this.web3Service.setWeb3WalletData(this.wallet.provider,address);
                this.walletAddress = address;
                if (address && address !== undefined) {
                  localStorage.setItem("wallet", this.wallet.name)
                  // this.connectAPI(address);
                } else {
                  // this.logoutAction();
                }
              }
            },
            network: network => {
              if (network !== undefined && network != config.onboard.network ) {
                  this.wrongNetwork = true;
                  this.toastrService.info("Please choose proper blockchain");
              } else {
                  this.wrongNetwork = false;
              }
            },
            wallet: wallet => {
              this.connectWallet(wallet);
            }
          },
      });
    }

    ngOnInit(): void {
        this.userData = this.authenticationService.getUserData();
        if (window.ethereum) {
          this.getAccountData();
        }
    }

    getValidValue(valu:any) {
        if (valu > 0) {
          let usrBal = this.web3js.utils.fromWei(valu, 'ether')
          return Number(usrBal).toFixed(2)
        }
        return valu
      }

    connectWalletAction = async () => {
        await this.onboard.walletReset();
        await this.onboard.walletSelect();
        await this.onboard.walletCheck();
    }
    
    connectWallet = async (wallet: any) => {
        console.log(wallet);
        if (wallet && wallet !== undefined) {
            localStorage.setItem("wallet",wallet.name)
            this.wallet = wallet;
        }
    }

    getAccountData = async() => {
      console.log(1);
      this.web3js = new Web3(window.ethereum);
      await this.web3js.eth.getAccounts((err:any, accounts:any) =>{
        console.error(err);
        console.log(accounts);
        if(accounts.length > 0){
          this.web3Service.setWeb3WalletData(window.ethereum,accounts[0]);
          this.walletAddress = accounts[0];

        }
      });
  }

    logoutWallet = async () => {
        localStorage.removeItem("wallet");
        await this.onboard.walletReset();
    }

    logout(){
        this.logoutWallet();
        this.authenticationService.logout();
        this.router.navigate(['auth/sign-in']);
    }

    hideMenu(){
        this.isCollapsed = true;
    }

}