import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'cx-saved-cart-details-overview',
  templateUrl: './saved-cart-details-overview.component.html'
})
export class SavedCartDetailsOverviewComponent implements OnInit {

  cart: any = {
    net: "",
    totalDiscounts: {
      value: "sadasd"
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

}
