import { UserComponent } from "app/user/user.component";
import { TransactionComponent } from "app/user/transaction/transaction.component";
import { CommissionComponent } from "app/user/commission/commission.component";
import { TokenComponent } from "app/user/token/token.component";
import { DashboardComponent } from "app/user/dashboard/dashboard.component";
import { ProfileComponent } from "app/user/profile/profile.component";
import { NetworkComponent } from "app/user/network/network.component";
import { NotfoundComponent } from "app/shared-components/notfound/notfound.component";
import { DepositHistoryComponent } from "app/user/deposit-history/deposit-history.component";
import { WalletDetailComponent } from "app/shared-components/wallet-detail/wallet-detail.component";
import { WalletComponent } from "app/user/wallet/wallet.component";

export const userAdminRouting = [
  {
    path: 'wallet',             
    children: [
      {
        path: '',
        component: WalletComponent
      },
      {
        path: ':walletName',
        component: WalletDetailComponent
      }
    ]
  },
  {path: 'transaction', component: TransactionComponent},
  {path: 'commission', component: CommissionComponent},
  {path: 'token', component: TokenComponent},             
  {path: 'network', component: NetworkComponent}  
]