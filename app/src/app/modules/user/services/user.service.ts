import { Injectable } from '@angular/core';
import { ApiConstants } from 'app/constants/api.constants';
import { BaseService } from 'app/core/service/base.service';

@Injectable({ providedIn: 'root' })

export class UserService {
    currentLang:string;
    userAuth:string;
    constructor(
        private baseService: BaseService,
    ) {
        
    }

    dashboard(data:any) {
        return this.baseService.postRequest(ApiConstants.DASHBOARD,data);
    }

    update(data:any) {
        return this.baseService.postRequest(ApiConstants.UPDATE,data);
    }

    savePayment(data:any) {
        return this.baseService.postRequest(ApiConstants.SAVEPAYMENT,data);
    }

    getEthValue() {
        const EthToUsdApiURL:string = 'https://min-api.cryptocompare.com/data/price?api_key=a46081438f9c55f1b22305d56c9653fc809f0dff128bee4c1c78ea5f8c021f5f&fsym=ETH&tsyms=USD'
        return this.baseService.getRequest(EthToUsdApiURL);
    }
    
    
}