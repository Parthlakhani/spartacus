import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DELIVERY_MODE_NORMALIZER, OccConfig } from '@spartacus/core';
import { Address } from '../../../model/address.model';
import { Cart } from '../../../model/cart.model';
import {
  ADDRESS_NORMALIZER,
  ADDRESS_SERIALIZER,
} from '../../../user/connectors/address/converters';
import { ConverterService } from '../../../util/converter.service';
import { Occ } from '../../occ-models/occ.models';
import { OccCheckoutDeliveryAdapter } from './occ-checkout-delivery.adapter';

const userId = '123';
const cartId = '456';
const cartData: Cart = {
  store: 'electronics',
  guid: '1212121',
};

const MockOccModuleConfig: OccConfig = {
  backend: {
    occ: {
      baseUrl: '',
      prefix: '',
      endpoints: {
        deliveryAddresses: 'users/${userId}/carts/${cartId}/addresses/delivery',
        deliveryMode: 'users/${userId}/carts/${cartId}/deliverymode',
        deliveryModes: 'users/${userId}/carts/${cartId}/deliverymodes',
      },
    },
  },
  context: {
    baseSite: [''],
  },
};

describe('OccCheckoutDeliveryAdapter', () => {
  let service: OccCheckoutDeliveryAdapter;
  let httpMock: HttpTestingController;
  let converter: ConverterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OccCheckoutDeliveryAdapter,
        { provide: OccConfig, useValue: MockOccModuleConfig },
      ],
    });
    service = TestBed.inject(OccCheckoutDeliveryAdapter);
    httpMock = TestBed.inject(HttpTestingController);
    converter = TestBed.inject(ConverterService);

    spyOn(converter, 'pipeable').and.callThrough();
    spyOn(converter, 'pipeableMany').and.callThrough();
    spyOn(converter, 'convert').and.callThrough();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('create an address for cart', () => {
    it('should create address for cart for given user id, cart id and address', () => {
      const mockAddress: Address = {
        firstName: 'Mock',
        lastName: 'Address',
      };

      let result;
      service
        .createAddress(userId, cartId, mockAddress)
        .subscribe((res) => (result = res));

      const mockReq = httpMock.expectOne((req) => {
        console.log('url-1', req.url);
        return (
          req.method === 'POST' &&
          req.url === `/users/${userId}/carts/${cartId}/addresses/delivery`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(mockAddress);
      expect(result).toEqual(mockAddress);
      expect(converter.pipeable).toHaveBeenCalledWith(ADDRESS_NORMALIZER);
      expect(converter.convert).toHaveBeenCalledWith(
        mockAddress,
        ADDRESS_SERIALIZER
      );
    });
  });

  describe('set an address for cart', () => {
    it('should set address for cart for given user id, cart id and address id', () => {
      const addressId = 'addressId';

      let result;
      service
        .setAddress(userId, cartId, addressId)
        .subscribe((res) => (result = res));

      const mockReq = httpMock.expectOne((req) => {
        console.log('url0', req.url);
        return (
          req.method === 'PUT' &&
          req.url ===
            `/users/${userId}/carts/${cartId}/addresses/delivery?addressId=${addressId}`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(cartData);
      expect(result).toEqual(cartData);
    });
  });

  describe('get all supported delivery modes for cart', () => {
    it('should get all supported delivery modes for cart for given user id and cart id', () => {
      const mockDeliveryModes: Occ.DeliveryModeList = {
        deliveryModes: [{ name: 'mockDeliveryMode' }],
      };
      let result;
      service
        .getSupportedModes(userId, cartId)
        .subscribe((res) => (result = res));

      const mockReq = httpMock.expectOne((req) => {
        console.log('url1', req.url);
        return (
          req.method === 'GET' &&
          req.url === `/users/${userId}/carts/${cartId}/deliverymodes`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(mockDeliveryModes);
      expect(result).toEqual(mockDeliveryModes.deliveryModes);
      expect(converter.pipeableMany).toHaveBeenCalledWith(
        DELIVERY_MODE_NORMALIZER
      );
    });
  });

  describe('get delivery mode for cart', () => {
    it('should delivery modes for cart for given user id and cart id', () => {
      let result;
      service.getMode(userId, cartId).subscribe((res) => (result = res));

      const mockReq = httpMock.expectOne((req) => {
        console.log('url2', req.url);

        return (
          req.method === 'GET' &&
          req.url === `/users/${userId}/carts/${cartId}/deliverymode`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(cartData);
      expect(result).toEqual(cartData);
      expect(converter.pipeable).toHaveBeenCalledWith(DELIVERY_MODE_NORMALIZER);
    });
  });

  describe('set delivery mode for cart', () => {
    it('should set modes for cart for given user id, cart id and delivery mode id', () => {
      const deliveryModeId = 'deliveryModeId';

      let result;
      service
        .setMode(userId, cartId, deliveryModeId)
        .subscribe((res) => (result = res));

      const mockReq = httpMock.expectOne((req) => {
        console.log('url3', req.url);
        return (
          req.method === 'PUT' &&
          req.url ===
            `/users/${userId}/carts/${cartId}/deliverymode?deliveryModeId=${deliveryModeId}`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(cartData);
      expect(result).toEqual(cartData);
    });
  });
});
