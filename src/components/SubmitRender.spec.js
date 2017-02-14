import React from 'react';
import { shallow } from 'enzyme';
import SubmitRender from './SubmitRender';

// <SubmitRender
//   isPreview={this.state.isPreview}
//   onChange={this.handlePreviewChange}
//   placeOrder={this.handlePlaceOrder}
//   allowSubmit={this.state.allowSubmit}
//   userSettingsData={this.props.userSettingsData}
//   placePreviewOrder={this.handlePlacePreviewOrder}
// />

var fakeEventTrigger;
jest.mock('../utils/confirm');

describe('SubmitRender', () => {
  beforeAll(() => {
    // mocking jQuery $()
    let fakeQuery = jest.fn(() => {
      return {
        on: function (str, callback) {
          fakeEventTrigger = (evt) => {
            callback(evt, str);
          }
          return fakeQuery;
        }
      }
    })
    global.window.$ = fakeQuery;
  });

  it('renders without crashing', () => {
    expect(() => shallow(
      <SubmitRender />
    )).not.toThrow();
  });

  it('prevents external form submission by default', () => {
    const component = shallow( <SubmitRender /> );
    const fakePreventDefault = jest.fn()
    const fakeSubmitEvent = {preventDefault: fakePreventDefault}

    component.instance().confirmOrder = jest.fn();
    fakeEventTrigger(fakeSubmitEvent);

    expect(fakePreventDefault).toHaveBeenCalled();
  });

  it('allows external form submission if allowSubmit is true', () => {
    shallow( <SubmitRender allowSubmit={ true } /> );
    const fakePreventDefault = jest.fn()
    const fakeSubmitEvent = {preventDefault: fakePreventDefault}

    fakeEventTrigger(fakeSubmitEvent);

    expect(fakePreventDefault).not.toHaveBeenCalled();
  });

  it('calls props.placeOrder() if it is a preview', () => {
    const fakePlaceOrder = jest.fn();
    shallow( <SubmitRender
      isPreview={ true }
      userSettingsData={{isChargePerOrder: false}}
      placeOrder={ fakePlaceOrder } /> );
    const fakeSubmitEvent = {preventDefault: jest.fn()}

    fakeEventTrigger(fakeSubmitEvent);

    expect(fakePlaceOrder).toHaveBeenCalled();
  });

  it('calls a confirm box if not a preview A', () => {
    const fakePlaceOrder = jest.fn();
    shallow( <SubmitRender
      isPreview={ false }
      userSettingsData={{isChargePerOrder: false}}
      placeOrder={ fakePlaceOrder } /> );
    const fakeSubmitEvent = {preventDefault: jest.fn()}

    // mocked at top of this file, so the require is hijacked
    // and calls the __mocks__ directory version
    let confirm = require('../utils/confirm').defineTestCall(jest.fn());

    fakeEventTrigger(fakeSubmitEvent);

    expect(fakePlaceOrder).not.toHaveBeenCalled();
    expect(confirm).toHaveBeenCalledTimes(1);
  });

});
