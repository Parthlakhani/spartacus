import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { OccProductService } from './product/product.service';
import { OccProductSearchService } from './product/product-search.service';
import { OccSiteService } from './site-context/occ-site.service';

import { ConfigService } from './config.service';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [OccProductSearchService, OccProductService, OccSiteService]
})
export class NewOccModule {
  static forRoot(config: any): any {
    return {
      ngModule: NewOccModule,
      providers: [
        {
          provide: ConfigService,
          useExisting: config
        }
      ]
    };
  }
}
