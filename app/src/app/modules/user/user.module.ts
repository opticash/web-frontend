import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ToastrModule } from 'ngx-toastr';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DepositComponent } from './pages/deposit/deposit.component';
import { UserRoutingModule } from './user.routing';
import { QRCodeModule } from 'angularx-qrcode';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { MyAccountComponent } from './pages/my-account/my-account.component';

@NgModule({
  declarations: [
    DashboardComponent,
    DepositComponent,
    TransactionsComponent,
    MyAccountComponent
  ],
  imports: [
    UserRoutingModule,
    SharedModule,
    QRCodeModule,
    ToastrModule.forRoot(),
  ],
  providers: [],
})
export class UserModule { }

