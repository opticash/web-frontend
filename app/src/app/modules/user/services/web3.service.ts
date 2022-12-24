import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Web3 from "web3";
import Onboard from 'bnc-onboard'
import { config } from 'app/constants/config';
import { ToastrService } from 'ngx-toastr';
declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
    wallet: any = null;
    onboard: any = null;
    web3js: any;
    web3Wallet:any;
    web3Provider:any;
    isWalletConnected:boolean = false; 
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
    private walletAddressSource = new Subject<any>();
    walletAddress$ = this.walletAddressSource.asObservable();
    private accountStatusSource = new Subject<any>();
    accountStatus$ = this.accountStatusSource.asObservable();

    constructor(
        private toastrService:ToastrService,
    ) {

        if (typeof window.ethereum !== 'undefined') {
            console .log('MetaMask is installed!');
        } else {
            console .log('MetaMask is Not installed!');
        }

        if (window.ethereum) {
            this.getAccountData();
            this.isWalletConnected = true;
        }

        this.onboard = Onboard({
            dappId: config.onboard.key,       // [String] The API key created by step one above
            networkId: config.onboard.network,  // [Integer] The Ethereum network ID your Dapp uses.
            darkMode: true,
            blockPollingInterval: 4000,
            walletSelect: { wallets: this.wallets },
            subscriptions: {
                address: address => {
                    if (this.wallet.provider !== undefined) {
                        if (address && address !== undefined) {
                            this.setWeb3WalletData(this.wallet.provider,address);
                            this.walletAddress = address;
                        } else {
                            this.logoutWallet();
                        }
                        this.walletAddressSource.next(this.walletAddress)
                    }
                },
                network: network => {
                    if (network !== undefined && network != config.onboard.network ) {
                        this.wrongNetwork = true;
                        this.toastrService.info("Please choose proper blockchain");
                    } else {
                        this.wrongNetwork = false;
                    }
                    this.accountStatusSource.next(this.wrongNetwork)
                },
                wallet: wallet => {
                    this.connectWallet(wallet);
                }
            },
        });
    }

    connectWalletAction = async () => {
        await this.onboard.walletReset();
        await this.onboard.walletSelect();
        await this.onboard.walletCheck();
    }

    connectWallet = async (wallet: any) => {
        if (wallet && wallet !== undefined) {
            this.wallet = wallet;
        }
    }

    setWeb3WalletData(provider:any, address:any):void{
        this.walletAddress = address;
        this.web3Provider = provider;
        this.web3js = new Web3(this.web3Provider);
        this.isWalletConnected = true;
    }

    logoutWallet = async () => {
        await this.onboard.walletReset();
    }

    setIsWalletConnected(value:boolean) : void{
        this.isWalletConnected = value;
    }

    getIsWalletConnected(){
        return this.isWalletConnected;
    }

    getValidValue(valu:any) {
        if (valu > 0) {
            let usrBal = this.web3js.utils.fromWei(valu, 'ether')
            return Number(usrBal).toFixed(2)
        }
        return valu
    }

    switchToBinance = async () => {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: this.web3js.utils.toHex(config.onboard.network) }]
        });
    }

    getAccountData = async() => {
        console.log(1);
        this.web3js = new Web3(window.ethereum);
        await this.web3js.eth.getAccounts((err:any, accounts:any) =>{
          console.error(err);
          console.log(accounts);
          if(accounts.length > 0){
            this.setWeb3WalletData(window.ethereum,accounts[0]);
            this.isWalletConnected = true;
            this.walletAddress = accounts[0];
            this.walletAddressSource.next(this.walletAddress)
          }
        });
      }

}
