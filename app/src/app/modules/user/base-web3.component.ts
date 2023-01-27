import { config } from "rxjs";
import { Web3Service } from "./services/web3.service";
import Web3 from "web3";

export abstract class BaseWeb3Class {
    
    public web3js: any;
    public wallet: any = null;
    currentBalance: string;
    allocation: string;
    unlocked: any;
    claimed: string;
    activeToken:string;
    walletAddress: string = ''
    configToken:any = config;
    isWalletConnected:boolean = false;
    wrongNetwork: boolean = false;
    confirmModal: string = '';

    constructor(
        public web3Service:Web3Service,
    ) {
        
    }

    bindWeb3Service( ){
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
            if(!this.wrongNetwork){
                this.web3js = new Web3(this.web3Service.web3Provider);
            }
        });
        this.web3Service.accountStatus$.subscribe(x => {
            this.wrongNetwork = x;
        });
    
    }

    connectWalletAction(){
        this.web3Service.connectWalletAction();
    }

    changeNetwork(){
        this.web3Service.switchToBinance();
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
 
}