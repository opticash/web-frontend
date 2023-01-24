import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DepositComponent } from './pages/deposit/deposit.component';
import { MyAccountComponent } from './pages/my-account/my-account.component';
import { MyTokenComponent } from './pages/my-token/my-token.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'deposit',
        component: DepositComponent
      },
      {
        path: 'deposit/:type',
        component: DepositComponent
      },
      {
        path: 'transactions',
        component: TransactionsComponent
      },
      {
        path: 'my-account',
        component: MyAccountComponent
      },
      {
        path: 'my-token',
        component: MyTokenComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }