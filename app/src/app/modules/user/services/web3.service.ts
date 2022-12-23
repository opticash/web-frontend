import { Injectable } from '@angular/core';
import Web3 from "web3";

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  web3js: any;
  address:any;
  web3Wallet:any;
  web3Provider:any;
  isWalletConnected:boolean = false; 

  constructor() {

  }

  setWeb3WalletData(provider:any, address:any):void{
      this.address = address;
      this.web3Provider = provider;
      this.web3js = new Web3(this.web3Provider);
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

}
