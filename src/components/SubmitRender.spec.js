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

jest.mock('../utils/confirm');
jest.mock('../utils/dom-queries');

let fakeAddEventListener = jest.fn();
require('../utils/dom-queries').find = () => [{
  addEventListener: fakeAddEventListener
}]

describe('SubmitRender', () => {
  it('renders without crashing', () => {
    expect(() => shallow(
      <SubmitRender />
    )).not.toThrow();
  });

  it('hijacks the main form', () => {
    fakeAddEventListener = jest.fn();
    shallow( <SubmitRender /> );

    expect(fakeAddEventListener).toHaveBeenCalled();
  });

  it('prevents external form submission by default', () => {
    const component = shallow( <SubmitRender /> );
    const fakePreventDefault = jest.fn()
    const fakeSubmitEvent = {preventDefault: fakePreventDefault}
    component.instance().confirmOrder = jest.fn();

    component.instance().handleSubmit(fakeSubmitEvent);

    expect(fakePreventDefault).toHaveBeenCalled();
  });

  it('allows external form submission if allowSubmit is true', () => {
    const component = shallow( <SubmitRender allowSubmit={ true } /> );
    const fakePreventDefault = jest.fn()
    const fakeSubmitEvent = {preventDefault: fakePreventDefault}
    component.instance().confirmOrder = jest.fn();

    component.instance().handleSubmit(fakeSubmitEvent);

    expect(fakePreventDefault).not.toHaveBeenCalled();
  });

  it('calls props.placeOrder() if it is a preview', () => {
    const fakePlaceOrder = jest.fn();
    const component = shallow( <SubmitRender
      isPreview={ true }
      userSettingsData={{isChargePerOrder: false}}
      placeOrder={ fakePlaceOrder } /> );
    const fakeSubmitEvent = {preventDefault: jest.fn()}

    component.instance().handleSubmit(fakeSubmitEvent);

    expect(fakePlaceOrder).toHaveBeenCalled();
  });

  it('calls a confirm box if not a preview A', () => {
    const fakePlaceOrder = jest.fn();
    const component = shallow( <SubmitRender
      isPreview={ false }
      userSettingsData={{isChargePerOrder: false}}
      placeOrder={ fakePlaceOrder } /> );
    const fakeSubmitEvent = {preventDefault: jest.fn()}

    // mocked at top of this file, so the require is hijacked
    // and calls the __mocks__ directory version
    let confirm = require('../utils/confirm').defineTestCall(jest.fn());

    component.instance().handleSubmit(fakeSubmitEvent);

    expect(fakePlaceOrder).not.toHaveBeenCalled();
    expect(confirm).toHaveBeenCalledTimes(1);
  });

});
