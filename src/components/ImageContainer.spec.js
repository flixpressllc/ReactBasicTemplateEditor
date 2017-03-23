import React from 'react';
import { mount } from 'enzyme';
import ImageContainer from './ImageContainer';
import { isObject } from 'happy-helpers';

jest.mock('../actions/ContainerActions');
const FakeContainerActions = require('../actions/ContainerActions');

const swapButtonSelector = '.reactBasicTemplateEditor-ImageContainer-swapImageButton';
const removeButtonSelector = '.reactBasicTemplateEditor-ImageContainer-removeImageButton';

// <ImageContainer
//   images={ [ arrayOfImages ] }
//   onUpdateImages={ () => {} }
// />

function getSettings ( overrides ) {
  overrides = isObject(overrides) ? overrides : {};
  let defaults = {
    images: [],
    imageBank: [],
    fieldName: 'myImageContainer'
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

  describe('remove button', () => {
    it('calls updateImages omitting the removed image', () => {
      let settings = {
        images: [
          {file: 'toast.jpg'},
          {file: 'coffee.jpg'}
        ]
      };
      const component = mount(<ImageContainer {...getSettings(settings)}/>);

      component.find(removeButtonSelector).at(0).simulate('click');

      expect(FakeContainerActions.changeContainer).toHaveBeenLastCalledWith('userImageChooser', 'myImageContainer', {'containedImages': [{'file': 'coffee.jpg', 'id': 1}]});
    });
  });

  describe('swap button', () => {
    it('displays the image bank when the swap button is clicked', () => {
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

      component.find(swapButtonSelector).at(0).simulate('click');
      let renderedImages = component.render().find('img');

      expect(renderedImages.length).toEqual(4);
      settings.imageBank.map((val, i) => {
        expect(renderedImages.eq(i).attr('src')).toContain(val);
      });
    });

    it('swaps out the image when a new one is chosen', () => {
      let settings = {
        images: [
          {file: 'toast.jpg'}
        ],
        fieldName: 'myField',
        imageBank: [
          'toast.jpg',
          'coffee.jpg',
          'eggs.jpg',
          'milk.jpg'
        ]
      };
      const component = mount(<ImageContainer {...getSettings(settings)}/>);

      component.find(swapButtonSelector).at(0).simulate('click');
      component.find('img').at(2).simulate('click');

      expect(FakeContainerActions.changeContainer).toHaveBeenLastCalledWith('userImageChooser', 'myField', {'containedImages': [{'file': 'eggs.jpg', 'id': 0}]});
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

        expect(component.find(swapButtonSelector).length).toEqual(0);
      });
    });

  });


  describe('captions:', () => {
    it('will show the correct number of caption fields', () => {
      let settings = {
        images: [ {file: 'toast.jpg', captions:['','','']}, {file: 'coffee.jpg', captions:['','','']} ],
        captions: [ 'one','two','three' ]
      }
      const component = mount(<ImageContainer {...getSettings(settings)}/>);

      expect(component.find('input').length).toEqual(6);
    });

    it('will label the caption fields properly', () => {
      let settings = {
        images: [ {file: 'toast.jpg', captions:['','','']}, {file: 'coffee.jpg', captions:['','','']} ],
        captions: [ 'one','two','three' ]
      }
      const component = mount(<ImageContainer {...getSettings(settings)}/>);

      expect(component.find('input').get(0).placeholder).toEqual('Optional one');
      expect(component.find('input').get(1).placeholder).toEqual('Optional two');
      expect(component.find('input').get(2).placeholder).toEqual('Optional three');
    });

    it('will allow for an object with settings as the main captions directive', () => {
      let settings = {
        images: [ {file: 'toast.jpg', captions:['','','']}, {file: 'coffee.jpg', captions:['','','']} ],
        captions: [
          'one',
          { label: 'two', settings: {maxCharacters: 3} },
          'three'
        ]
      }
      const component = mount(<ImageContainer {...getSettings(settings)}/>);

      expect(component.find('input').get(1).placeholder).toEqual('Optional two');
    });

    describe('filter options', () => {
      describe('maxCharacters', () => {
        it('allows only last character typed if set to 1', () => {
          let settings = {
            images: [ {file: 'toast.jpg', captions:['','','']}, {file: 'coffee.jpg', captions:['','','']} ],
            captions: [
              'one',
              { label: 'two', settings: {maxCharacters: 1} },
              'three'
            ]
          }
          const fakeEvent = {target:{value:'abcdefg'}};
          const component = mount(<ImageContainer {...getSettings(settings)}/>);

          component.find('input').at(1).simulate('change', fakeEvent);

          expect(FakeContainerActions.changeContainer).toMatchSnapshot()
        });

        it('allows only first n characters when set to n > 1', () => {
          let settings = {
            images: [ {file: 'toast.jpg', captions:['','','']}, {file: 'coffee.jpg', captions:['','','']} ],
            captions: [
              'one',
              { label: 'two', settings: {maxCharacters: 3} },
              'three'
            ]
          }
          const fakeEvent = {target:{value:'abcdefg'}};
          const component = mount(<ImageContainer {...getSettings(settings)}/>);

          component.find('input').at(1).simulate('change', fakeEvent);

          expect(FakeContainerActions.changeContainer).toMatchSnapshot()
        });
      });
    });
  });

});
