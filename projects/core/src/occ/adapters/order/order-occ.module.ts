import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ORDER_NORMALIZER } from '../../../checkout/connectors/checkout/converters';
import { REPLENISHMENT_ORDER_NORMALIZER } from '../../../checkout/connectors/replenishment-order/converters';
import {
  OccOrderNormalizer,
  OccReplenishmentOrderNormalizer,
} from './converters/index';

@NgModule({
  imports: [CommonModule],
  providers: [
    {
      provide: ORDER_NORMALIZER,
      useExisting: OccOrderNormalizer,
      multi: true,
    },
    {
      provide: REPLENISHMENT_ORDER_NORMALIZER,
      useExisting: OccReplenishmentOrderNormalizer,
      multi: true,
    },
  ],
})
export class OrderOccModule {}
