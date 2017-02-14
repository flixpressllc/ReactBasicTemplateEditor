import React from 'react';
import { mount } from 'enzyme';
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
        'milk.jpg'
      ]
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
        'milk.jpg'
      ]
    };
    const component = mount(<ImageContainer {...getSettings(settings)}/>);

    component.find('button').at(0).simulate('click');
    let renderedImages = component.render().find('img');

    expect(renderedImages.length).toEqual(4);
    settings.imageBank.map((val, i) => {
      expect(renderedImages.eq(i).attr('src')).toContain(val);
    });
  });

  it('swaps out the image when a new one is chosen', () => {
    const fakeChangeArray = jest.fn();
    let settings = {
      images: [
        {file: 'toast.jpg'}
      ],
      imageBank: [
        'toast.jpg',
        'coffee.jpg',
        'eggs.jpg',
        'milk.jpg'
      ],
      onUpdateImages: fakeChangeArray
    };
    const component = mount(<ImageContainer {...getSettings(settings)}/>);

    component.find('button').at(0).simulate('click');
    component.find('img').at(2).simulate('click');

    expect(fakeChangeArray).toHaveBeenCalledWith([{file: 'eggs.jpg', id:0}]);
  });

  describe('when the image bank has 1 image', () => {
    it('will not display the Change Image button', () => {
      let settings = {
        images: [
          {file: 'toast.jpg'}
        ],
        imageBank: [
          'toast.jpg'
        ]
      };
      const component = mount(<ImageContainer {...getSettings(settings)}/>);

      expect(component.find('button').length).toEqual(0);
    });
  });

});
