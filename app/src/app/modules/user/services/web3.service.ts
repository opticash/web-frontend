import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from '@walletconnect/web3-provider'
import { config } from 'app/constants/config';
import { ToastrService } from 'ngx-toastr';
import WalletLink from 'walletlink'
declare let window: any;
declare let $: any;

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
    web3js: any;
    web3Wallet:any;
    web3Provider:any;
    isWalletConnected:boolean = false; 
    walletAddress: string = ''
    wrongNetwork: boolean = false;

    private provider: any;
    private accounts: any;
    
    providerOptions:any = {
        injected: {
            display: {
              description: " "
            },
            package: null
          },
          'custom-walletlink': {
            display: {
              logo: 'assets/images/coinbase-wallet.svg',
              name: 'Coinbase',
              description: " "
            },
            options: {
              appName: 'Opticash', // Your app name
              networkUrl: `https://goerli.infura.io/v3/defa9004b56046e1a9ba73bc5d9e5776`,
              chainId: 5,
            },
            package: WalletLink,
            connector: async (_:any, options:any) => {
              const { appName, networkUrl, chainId } = options
              const walletLink = new WalletLink({
                appName: 'Opticash',
                appLogoUrl: 'assets/images/logo.png',
                darkMode: true
              });
              const provider = walletLink.makeWeb3Provider(networkUrl, chainId);
              await provider.enable();
              return provider;
            },
          },
          walletconnect: {
            package: WalletConnectProvider,
            display: {
              description: " "
            },
            options: {
              infuraId: config.onboard.infura_id,
              rpc: {
                5: 'https://goerli.infura.io/v3/',
              }
            },
          }
        // injected: {
        //   display: {
        //     description: " "
        //   },
        //   package: null
        // },
        // walletconnect: {
        //   package: WalletConnectProvider,
        //   display: {
        //     description: " "
        //   },
        //   options: {
        //     infuraId: config.onboard.infura_id,
        //     rpc: {
        //       5: 'https://goerli.infura.io/v3/',
        //     }
        //   },
        // }
    };

    web3Modal:any = new Web3Modal({
        network: "mainnet", // optional
        cacheProvider: true, // optional
        providerOptions:this.providerOptions, // required
        // theme: {
        //   background: "rgb(39, 49, 56)",
        //   main: "rgb(199, 199, 199)",
        //   secondary: "rgb(136, 136, 136)",
        //   border: "rgba(195, 195, 195, 0.14)",
        //   hover: "rgb(16, 26, 32)"
        // }
    });
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

        // this.onboard = Onboard({
        //     dappId: config.onboard.key,       // [String] The API key created by step one above
        //     networkId: config.onboard.network,  // [Integer] The Ethereum network ID your Dapp uses.
        //     darkMode: true,
        //     blockPollingInterval: 4000,
        //     walletSelect: { wallets: this.wallets },
        //     subscriptions: {
        //         address: address => {
        //             if (this.wallet.provider !== undefined) {
        //                 if (address && address !== undefined) {
        //                     this.setWeb3WalletData(this.wallet.provider,address);
        //                     this.walletAddress = address;
        //                 } else {
        //                     this.logoutWallet();
        //                 }
        //                 this.walletAddressSource.next(this.walletAddress)
        //             }
        //         },
        //         network: network => {
        //             if (network !== undefined && network != config.onboard.network ) {
        //                 this.wrongNetwork = true;
        //                 this.toastrService.info("Please choose proper blockchain");
        //             } else {
        //                 this.wrongNetwork = false;
        //             }
        //             this.accountStatusSource.next(this.wrongNetwork)
        //         },
        //         wallet: wallet => {
        //             this.connectWallet(wallet);
        //         }
        //     },
        // });
        if(window.ethereum){
            window.ethereum.on('accountsChanged', async (accounts:any) => {
                console.log('wrongNetwork',this.wrongNetwork);
                this.walletAddressSource.next(accounts[0]);
                const network = await this.web3js.eth.net.getId();
                this.isWrongNetwork(network);
            });
            
            window.ethereum.on('networkChanged', async (network:any) => {
                this.isWrongNetwork(network);
            });
        }
        this.installMetamask()
    }

    installMetamask() {
        if (!(window.web3 || window.ethereum)) {
          if ($('#installMetaMask').length < 1)
            $('.web3modal-modal-card').prepend('<div id="installMetaMask" class="cjAFRf web3modal-provider-wrapper"><a href="https://metamask.io/" target="_blank" class="cjAFRf web3modal-provider-container"><div class="jMhaxE web3modal-provider-icon"><img src="assets/images/metamask.svg" alt="MetaMask"></div><div class="bktcUM sc-web3modal-provider-name mt-0">Install MetaMask</div><div class="eFHlqH web3modal-provider-description">Connect using browser wallet</div></a></div>')
        }
    }

    connectWalletAction = async () => {
        this.web3Modal.clearCachedProvider();
        this.provider = await this.web3Modal.connect(); // set provider
        this.web3js = new Web3(this.provider); // create web3 instance
        this.walletAddress = await this.web3js.eth.getAccounts(); 
        const network = await this.web3js.eth.net.getId();
        this.isWrongNetwork(network);
        this.walletAddressSource.next(this.walletAddress);
        this.setWeb3WalletData(this.provider,this.walletAddress);
    }

    isWrongNetwork(network:any){
        if (network !== undefined && network != config.onboard.network ) {
            this.toastrService.info("Please choose proper blockchain",'',{positionClass:'toast-bottom-right'});
            this.wrongNetwork = true;
        } else {
            this.wrongNetwork = false;
        };
        this.accountStatusSource.next(this.wrongNetwork)
    }


    setWeb3WalletData(provider:any, address:any):void{
        this.walletAddress = address;
        this.web3Provider = provider;
        this.web3js = new Web3(this.web3Provider);
        this.isWalletConnected = true;
    }

    logoutWallet = async () => {
        await this.provider.close();
        await this.web3Modal.clearCachedProvider();
        this.provider = null;
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
