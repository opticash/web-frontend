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
                infuraId: config.Web3Modal.infura_id,
                rpc: {
                5: 'https://goerli.infura.io/v3/',
                }
            },
        }
    };

    web3Modal:any = new Web3Modal({
        network: "mainnet", // optional
        cacheProvider: true, // optional
        providerOptions:this.providerOptions, // required
    });
    private walletAddressSource = new Subject<any>();
    walletAddress$ = this.walletAddressSource.asObservable();
    private accountStatusSource = new Subject<any>();
    accountStatus$ = this.accountStatusSource.asObservable();

    constructor(
        private toastrService:ToastrService,
    ) {
        this.walletAddress = window.localStorage.getItem('accountAddress');
        if (typeof window.ethereum !== 'undefined' && this.walletAddress) {
            this.getAccountData()
            this.showModelConnetions();
            this.isWalletConnected = true;
        } else {
            console .log('MetaMask is Not installed!');
        }

        // if(window.ethereum){
        //     window.ethereum.on('accountsChanged', async (accounts:any) => {
        //         console.log('wrongNetwork',this.wrongNetwork);
        //         this.walletAddressSource.next(accounts[0]);
        //         const network = await this.web3js.eth.net.getId();
        //         this.isWrongNetwork(network);
        //     });
            
        //     window.ethereum.on('networkChanged', async (network:any) => {
        //         this.isWrongNetwork(network);
        //     });
        // }
        this.showModelConnetions();
        this.installMetamask();
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
        const account = await this.web3js.eth.getAccounts(); 
        const network = await this.web3js.eth.net.getId();
        this.isWrongNetwork(network);
        this.walletAddress = account[0]
        this.setWeb3WalletData(this.provider,this.walletAddress);
        this.walletAddressSource.next(this.walletAddress);
    }

    isWrongNetwork(network:any){
        if (network !== undefined && network != config.Web3Modal.network ) {
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
        window.localStorage.setItem('accountAddress', this.walletAddress)
    }

    logoutWallet = async () => {
        window.localStorage.removeItem('accountAddress');
        if(this.provider){
            await this.provider.close();
            await this.web3Modal.clearCachedProvider();
            this.provider = null;
        }
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
            params: [{ chainId: this.web3js.utils.toHex(config.Web3Modal.network) }]
        });
    }

    getAccountData = async() => {
        this.web3js = new Web3(window.ethereum);
        await this.web3js.eth.getAccounts((err:any, accounts:any) =>{
            console.log(accounts);
          if(accounts.length > 0){
            this.walletAddress = accounts[0];
            this.isWalletConnected = true;
            this.setWeb3WalletData(window.ethereum,accounts[0]);
            this.isWalletConnected = true;
          }
        });
        const network = await this.web3js.eth.net.getId();
        this.isWrongNetwork(network);
        this.walletAddressSource.next(this.walletAddress);
    }

    showModelConnetions = async() => {
        // Subscribe to accounts change
        window.ethereum.on('accountsChanged', (account:any) => {
            if (null !== account && account.length > 0) {
                this.walletAddress = account[0];
                this.setWeb3WalletData(this.provider,this.walletAddress);
                this.walletAddressSource.next(this.walletAddress);
                window.location.reload();
            } else {
                this.logoutWallet();
            }
        })

        // Subscribe to chainId change
        // this.provider.on('chainChanged', (chainId:any) => {
        //     window.location.reload();
        // });

        window.ethereum.on('networkChanged', (network:any) => {
            console.log('networkChanged');
            this.isWrongNetwork(network);
            window.location.reload();
        });

        // Subscribe to provider connection
        window.ethereum.on('connect', (info:any) => {
            console.log(info);
        })

        // Subscribe to provider disconnection
        window.ethereum.on('disconnect', (error:any) => {
            this.logoutWallet();
        })
    }
}
