import React from 'react';
import { shallow, mount } from 'enzyme';
import UserMessages from './UserMessages';

describe('UserMessages', () => {
  it('displays a plain text message', () => {
    const messages = [{message:'a message for you'}];
    const component = mount(<UserMessages messages={ messages }/>);

    expect(component.text()).toContain('a message for you');
  })

  // The htmlSafe option has been removed until it is necessary.
  // it('displays messages in raw html', () => {
  //   const messages = [{message:'a mess<span class="disruption"></span>age for you', htmlSafe: true}];
  //   const component = mount(<UserMessages messages={ messages }/>);

  //   expect(component.find('Message').text()).toContain('a message for you');
  // });

  // it('allows classes to be set for messages', () => {
  //   const messages = [{message:'a message for you', type:'biggest-message'}];
  //   const component = mount(<UserMessages messages={ messages }/>);

  //   expect(component.find('.biggest-message').length).toEqual(1);
  // });
})