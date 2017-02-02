import React from 'react';
import { mount, render, shallow } from 'enzyme';
import ImageContainer from './ImageContainer';
import { isObject } from '../utils/helper-functions';

// <ImageContainer
//   images={ [ arrayOfImages ] }
//   onUpdateImages={ () => {} }
// />

function getSettings ( overrides ) {
  overrides = isObject(overrides) ? overrides : {};
  let defaults = {
    images: [],
    onUpdateImages: () => {},
    imageBank: []
  };
  return Object.assign(defaults, overrides);
}

describe('ImageContainer', () => {
  it('renders without crashing', () => {
    expect(() => {
      mount(<ImageContainer {...getSettings()}/>);
    }).not.toThrow();
  });

  it('displays images', () => {
    let settings = {
      images: [
        {file: 'toast.jpg', id: 0},
        {file: 'coffee.jpg', id: 1}
      ]
    };
    let component = mount(<ImageContainer {...getSettings(settings)}/>);
    expect(component.find('img').length).toEqual(2);
  });
});
