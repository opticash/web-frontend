import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from '@walletconnect/web3-provider'
import { ToastrService } from 'ngx-toastr';
import WalletLink from 'walletlink'
import { environment } from 'environments/environment';
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
    configToken:any = environment.config;
    web3Network: string;
    networkType: string;
    providerOptions:any;
    web3Modal:any;
    private walletAddressSource = new Subject<any>();
    walletAddress$ = this.walletAddressSource.asObservable();
    private accountStatusSource = new Subject<any>();
    accountStatus$ = this.accountStatusSource.asObservable();
    
    constructor(
        private toastrService:ToastrService,
    ) {
        this.walletAddress = window.localStorage.getItem('accountAddress');
        this.web3Network = this.getWeb3Network() ? this.getWeb3Network() : 'ETH_NETWORK';
        this.networkType = this.getNetworkType(this.web3Network);
        
        this.providerOptions = {
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
                    networkUrl: this.configToken[this.web3Network].Web3Modal.rpcUrl,
                    chainId: this.configToken[this.web3Network].Web3Modal.network,
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
                    rpc: {
                        1: environment.config.ETH_NETWORK.Web3Modal.rpcUrl,
                        56: environment.config.BSC_NETWORK.Web3Modal.rpcUrl,
                        137: environment.config.POLY_NETWORK.Web3Modal.rpcUrl,
                        5: environment.config.ETH_NETWORK.Web3Modal.rpcUrl,
                        97: environment.config.BSC_NETWORK.Web3Modal.rpcUrl,
                        80001: environment.config.POLY_NETWORK.Web3Modal.rpcUrl,
                    }
                },
            }
        };
        this.web3Modal = new Web3Modal({
            network: "mainnet", // optional
            cacheProvider: true, // optional
            providerOptions:this.providerOptions, // required
        });
        if (typeof window.ethereum !== 'undefined' && this.walletAddress) {
            this.getAccountData()
            this.showModelConnetions();
            this.isWalletConnected = true;
        } else {
            console .log('MetaMask is Not installed!');
        }
        
        this.showModelConnetions();
        this.installMetamask();
    }

    getNetworkType(network:any):any{
        let networkType:string = '';
        if(network === 'ETH_NETWORK'){
            return networkType = 'ETH'
        }else if(network === 'BSC_NETWORK'){
            return networkType = 'BNB'
        }else if(network === 'POLY_NETWORK'){
            return networkType = 'MATIC'
        }
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
        this.web3Network = this.getWeb3Network();
        this.networkType = this.getNetworkType(this.web3Network);
    }

    isWrongNetwork(network:any){
        if (network !== undefined && network != this.configToken[this.web3Network].Web3Modal.network ) {
            this.toastrService.info("Please choose "+this.configToken[this.web3Network].Web3Modal.chainName,'',{positionClass:'toast-bottom-right'});
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

    switchToChain = async () => {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: this.web3js.utils.toHex(this.configToken[this.web3Network].Web3Modal.network),
                rpcUrls: [this.configToken[this.web3Network].Web3Modal.rpcUrl],
                chainName: this.configToken[this.web3Network].Web3Modal.chainName,
                nativeCurrency: this.configToken[this.web3Network].nativeCurrency,
                blockExplorerUrls: [this.configToken[this.web3Network].blockExplorerUrls]
            }]
        });
        this.getAccountData();
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
        window.localStorage.setItem('accountAddress', this.walletAddress)
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

    setWeb3Network(data:string){
        this.web3Network = data;
    }

    getWeb3Network():any{
        if(this.web3Network){
            return this.web3Network;
        } else {
            return localStorage.getItem('network');
        }
    }

}
