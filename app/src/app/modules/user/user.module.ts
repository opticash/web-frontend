import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ToastrModule } from 'ngx-toastr';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DepositComponent } from './pages/deposit/deposit.component';
import { UserRoutingModule } from './user.routing';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [
    DashboardComponent,
    DepositComponent
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

