import * as fromAction from '../actions/checkout.action';

const userId = 'testUserId';
const cartId = 'testCartId';
const selectedModeId = 'selectedModeId';

const address: any = {
  firstName: 'John',
  lastName: 'Doe',
  titleCode: 'mr',
  line1: 'Toyosaki 2 create on cart'
};

const modes: any = {
  mode1: 'mode1',
  mode2: 'mode2'
};

describe('Add Delivery Address to Cart Actions', () => {
  describe('AddDeliveryAddress', () => {
    it('should create the action', () => {
      const payload = {
        userId: userId,
        cartId: cartId,
        address: address
      };

      const action = new fromAction.AddDeliveryAddress(payload);
      expect({ ...action }).toEqual({
        type: fromAction.ADD_DELIVERY_ADDRESS,
        payload: payload
      });
    });
  });

  describe('AddDeliveryAddressFail', () => {
    it('should create the action', () => {
      const error = 'anError';
      const action = new fromAction.AddDeliveryAddressFail(error);

      expect({ ...action }).toEqual({
        type: fromAction.ADD_DELIVERY_ADDRESS_FAIL,
        payload: error
      });
    });
  });

  describe('AddDeliveryAddressSuccess', () => {
    it('should create the action', () => {
      const action = new fromAction.AddDeliveryAddressSuccess(address);
      expect({ ...action }).toEqual({
        type: fromAction.ADD_DELIVERY_ADDRESS_SUCCESS,
        payload: address
      });
    });
  });

  describe('Load Supported Delivery Modes from Cart', () => {
    describe('LoadSupportedDeliveryModes', () => {
      it('should create the action', () => {
        const payload = {
          userId: userId,
          cartId: cartId
        };

        const action = new fromAction.LoadSupportedDeliveryModes(payload);
        expect({ ...action }).toEqual({
          type: fromAction.LOAD_SUPPORTED_DELIVERY_MODES,
          payload: payload
        });
      });
    });

    describe('LoadSupportedDeliveryModesFail', () => {
      it('should create the action', () => {
        const error = 'anError';
        const action = new fromAction.LoadSupportedDeliveryModesFail(error);

        expect({ ...action }).toEqual({
          type: fromAction.LOAD_SUPPORTED_DELIVERY_MODES_FAIL,
          payload: error
        });
      });
    });

    describe('LoadSupportedDeliveryModesSuccess', () => {
      it('should create the action', () => {
        const action = new fromAction.LoadSupportedDeliveryModesSuccess(modes);
        expect({ ...action }).toEqual({
          type: fromAction.LOAD_SUPPORTED_DELIVERY_MODES_SUCCESS,
          payload: modes
        });
      });
    });
  });

  describe('Set Delivery Mode for Cart', () => {
    describe('SetDeliveryMode', () => {
      it('should create the action', () => {
        const payload = {
          userId: userId,
          cartId: cartId,
          selectedModeId: selectedModeId
        };

        const action = new fromAction.SetDeliveryMode(payload);
        expect({ ...action }).toEqual({
          type: fromAction.SET_DELIVERY_MODE,
          payload: payload
        });
      });
    });

    describe('SetDeliveryModeFail', () => {
      it('should create the action', () => {
        const error = 'anError';
        const action = new fromAction.SetDeliveryModeFail(error);

        expect({ ...action }).toEqual({
          type: fromAction.SET_DELIVERY_MODE_FAIL,
          payload: error
        });
      });
    });

    describe('SetDeliveryModeSuccess', () => {
      it('should create the action', () => {
        const action = new fromAction.SetDeliveryModeSuccess(selectedModeId);
        expect({ ...action }).toEqual({
          type: fromAction.SET_DELIVERY_MODE_SUCCESS,
          payload: selectedModeId
        });
      });
    });
  });

  describe('Clear Checkout Step', () => {
    describe('ClearCheckoutStep', () => {
      it('should create the action', () => {
        const action = new fromAction.ClearCheckoutStep(2);
        expect({ ...action }).toEqual({
          type: fromAction.CLEAR_CHECKOUT_STEP,
          payload: 2
        });
      });
    });
  });

  describe('Clear Checkout Data', () => {
    describe('ClearCheckoutData', () => {
      it('should create the action', () => {
        const action = new fromAction.ClearCheckoutData();
        expect({ ...action }).toEqual({
          type: fromAction.CLEAR_CHECKOUT_DATA
        });
      });
    });
  });
});
