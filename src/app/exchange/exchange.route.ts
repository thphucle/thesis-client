import { Routes } from "@angular/router";
import { ExchangeComponent } from "app/exchange/exchange/exchange.component";

export const exchangeRoutes: Routes = [
  {
    path: 'exchange',
    children: [
      {
        path: '',
        component: ExchangeComponent
      }
    ]
  }
];