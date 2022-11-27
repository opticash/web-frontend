import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/guard/auth.guard';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { UserLayoutComponent } from './layout/user-layout/user-layout.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/sign-in',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('app/modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: UserLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('app/modules/user/user.module').then(m => m.UserModule)
      },
    ]
  },
  // Fallback when no prior routes is matched
  { path: '**', redirectTo: 'auth/sign-in', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes,{scrollPositionRestoration: 'enabled'})
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}