import React from 'react';
import { shallow } from 'enzyme';
import YouTubeLink from './YouTubeLink';

it('renders without crashing', () => {
  shallow(<YouTubeLink />);
});

describe('share links', () => {
  it('understands a full youtu.be link', () => {
    pending();
  });

  it('understands a full youtu.be link with time attribute', () => {
    pending();
  });
});


describe('onblur', () => {
  it('adds an invalid class if invalid', () => {
    const component = shallow(<YouTubeLink />);
    const fakeCheck = () => component.setState({linkIsValid: false, linkWasChecked: true})
    component.instance().checkForValidity = fakeCheck;

    component.find('input').at(0).simulate('blur');

    expect(component.find('.invalid').length).toEqual(1);
  });

  it('adds an valid class if valid', () => {
    const component = shallow(<YouTubeLink />);
    const fakeCheck = () => component.setState({linkIsValid: true, linkWasChecked: true})
    component.instance().checkForValidity = fakeCheck;

    component.find('input').at(0).simulate('blur');

    expect(component.find('.valid').length).toEqual(1);
  });
});
