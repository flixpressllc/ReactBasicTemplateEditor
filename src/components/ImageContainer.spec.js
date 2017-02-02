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
        {file: 'toast.jpg'},
        {file: 'coffee.jpg'}
      ]
    };
    let component = mount(<ImageContainer {...getSettings(settings)}/>);
    expect(component.find('img').length).toEqual(2);
  });

  it('displays only non-bank images to start', () => {
    let settings = {
      images: [
        {file: 'toast.jpg'},
        {file: 'coffee.jpg'}
      ],
      imageBank: [
        'toast.jpg',
        'coffee.jpg',
        'eggs.jpg',
        'milk.jpg',
      ],
    };
    let component = mount(<ImageContainer {...getSettings(settings)}/>);
    expect(component.find('img').length).toEqual(2);
  });

  it('displays the image bank when the button is clicked', () => {
    let settings = {
      images: [
        {file: 'toast.jpg'},
        {file: 'coffee.jpg'}
      ],
      imageBank: [
        'toast.jpg',
        'coffee.jpg',
        'eggs.jpg',
        'milk.jpg',
      ],
    };
    const component = mount(<ImageContainer {...getSettings(settings)}/>);

    component.find('button').first().simulate('click');
    let renderedImages = component.render().find('img');

    expect(renderedImages.length).toEqual(4);
    settings.imageBank.map((val, i) => {
      expect(renderedImages.eq(i).attr('src')).toContain(val);
    });
  });

});
