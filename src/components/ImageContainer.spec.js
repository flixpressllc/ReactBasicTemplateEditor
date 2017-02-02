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

  it('displays only non-bank images to start', () => {
    let settings = {
      images: [
        {file: 'toast.jpg', id: 0},
        {file: 'coffee.jpg', id: 1}
      ],
      imageBank: [
        {file: 'toast.jpg', id: 0},
        {file: 'coffee.jpg', id: 1},
        {file: 'eggs.jpg', id: 2},
        {file: 'milk.jpg', id: 3},
      ],
    };
    let component = mount(<ImageContainer {...getSettings(settings)}/>);
    expect(component.find('img').length).toEqual(2);
  });

  it('displays the image bank when the button is clicked', () => {
    let settings = {
      images: [
        {file: 'toast.jpg', id: 0},
        {file: 'coffee.jpg', id: 1}
      ],
      imageBank: [
        {file: 'toast.jpg', id: 0},
        {file: 'coffee.jpg', id: 1},
        {file: 'eggs.jpg', id: 2},
        {file: 'milk.jpg', id: 3},
      ],
    };
    const component = mount(<ImageContainer {...getSettings(settings)}/>);

    component.find('button').first().simulate('click');

    expect(component.find('img').length).toEqual(4);
  });

});
