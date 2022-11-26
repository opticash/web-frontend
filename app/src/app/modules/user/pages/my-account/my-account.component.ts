import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'app/core/service/authentication.service';
import Validation from 'app/shared/utils/validation';
import { ToastrService } from 'ngx-toastr';
import { Md5 } from 'ts-md5';
import { UserService } from '../../services/user.service';
import Web3 from 'web3';
const web3 = new Web3();

@Component({
    selector: 'app-my-account',
    templateUrl: './my-account.component.html',
    styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {
    isEditView: boolean = false;
    userData: any;
    form: FormGroup;
    submitted: boolean = false;
    countryList = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia","Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];
    isSignUpCompleted : boolean = false;
    constructor(
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private toastrService:ToastrService
    ) { }

    ngOnInit(): void {
        this.userData = this.authenticationService.getUserData();
        const name = this.userData.name.split(' ');
        const fname = name[0]
        let lname = '';
        if(name.length > 1){
            lname = name[name.length - 1];
        }
        this.form = new FormGroup({
            name: new FormControl(fname, [Validators.required,Validators.minLength(3),Validators.maxLength(50),Validators.pattern('^[a-zA-Z \-\']+')]),
            lname: new FormControl(lname, [Validators.maxLength(50), Validators.pattern('^[a-zA-Z \-\']+')]),
            country: new FormControl(this.userData.country, Validators.required),
            email: new FormControl({value:this.userData.email,disabled:true}),
            wallet_addr: new FormControl(this.userData.wallet_addr,  [Validators.required,this.ValidateETHaddress]),
            passwd: new FormControl('', [Validators.minLength(3), Validators.maxLength(20)]),
            confirmPassword: new FormControl(''),
        },
        {
            validators: [Validation.match('passwd', 'confirmPassword')]
        });
        this.submitted = false;
    }
    
    editView(){
        this.isEditView = !this.isEditView;
        this.submitted = false;
        this.isSignUpCompleted = false;
    }
    
    onSubmit() {
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }
        this.isSignUpCompleted = false;
        this.form.value.passwd = this.form.value.passwd ? Md5.hashStr(this.form.value.passwd) : '';
        this.form.value.name = this.form.value.name +' '+this.form.value.lname;
        this.form.value.email = this.userData.email;
        this.userService.updateProfile(this.form.value).subscribe((data)=>{
            if(data.type){
                const obj = {
                    name: this.form.value.name,
                    email: this.form.value.email,
                    country: this.form.value.country,
                    wallet_addr: this.form.value.wallet_addr
                };
                this.authenticationService.setUserData(obj);
                this.isSignUpCompleted = true;
                this.toastrService.success(data.message);
                this.form.controls['passwd'].setValue('');
                this.form.controls['confirmPassword'].setValue('');
                this.editView();
            }

        })
    }

    get f(): { [key: string]: AbstractControl } {
        return this.form.controls;
    }

    ValidateETHaddress(control: AbstractControl): {[key: string]: any} | null  {
        if (control.value && !web3.utils.isAddress(control.value)) {
          return { 'addressInvalid': true };
        }
        return null;
      }

}
