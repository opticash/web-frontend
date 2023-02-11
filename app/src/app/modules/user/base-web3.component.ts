import { Web3Service } from "./services/web3.service";
import Web3 from "web3";
import { environment } from "environments/environment";

export abstract class BaseWeb3Class {
    
    public web3js: any;
    public wallet: any = null;
    currentBalance: string;
    allocation: string;
    unlocked: any;
    claimed: string;
    activeToken:string;
    walletAddress: string = ''
    isWalletConnected:boolean = false;
    wrongNetwork: boolean = false;
    confirmModal: string = '';
    selectNetworkModal: string = '';
    web3Network: any = 'ETH_NETWORK';
    networkType: any = 'ETH';
    configToken:any = environment.config;

    constructor(
        public web3Service:Web3Service,
    ) {
        
    }

    bindWeb3Service( ){
        this.web3Network = this.web3Service.getWeb3Network();
        this.networkType = this.web3Service.networkType;
        this.wrongNetwork = this.web3Service.wrongNetwork;
        this.walletAddress = this.web3Service.walletAddress;
        this.activeToken = 'Community';
        if(this.walletAddress ){
            this.isWalletConnected = true;
            if(!this.wrongNetwork){
                this.web3js = new Web3(this.web3Service.web3Provider);
            }
        } else {
            this.isWalletConnected = false;
        }
        
        if(this.wrongNetwork){
            this.isWalletConnected = true;
        }
        
        this.web3Service.walletAddress$.subscribe(x => {
            this.walletAddress = x;
            this.isWalletConnected = true;
            this.web3Network = this.web3Service.getWeb3Network();
            this.networkType = this.web3Service.getNetworkType(this.web3Network);
            if(!this.wrongNetwork){
                this.web3js = new Web3(this.web3Service.web3Provider);
            }
        });
        this.web3Service.accountStatus$.subscribe(x => {
            this.wrongNetwork = x;
        });
    }

    connectWalletAction(){
        this.hideSelectNetworkModal();
        localStorage.setItem('network',this.web3Network);
        this.web3Service.setWeb3Network(this.web3Network);
        this.web3Service.connectWalletAction();
    }

    changeNetwork(){
        this.web3Service.switchToChain();
    }

    logoutWallet(){
        this.web3Service.logoutWallet();
        window.location.reload();
    }

    showConfirmModal(){
        this.confirmModal = 'show';
    };
    
    hideConfirmModal(){
        this.confirmModal = '';
    }

    showSelectNetworkModal(){
        this.selectNetworkModal = 'show';
    }
    hideSelectNetworkModal(){
        this.selectNetworkModal = '';
    }

    getNetworkType(){
        this.networkType = this.web3Service.getNetworkType(this.web3Network);
    }
 
}