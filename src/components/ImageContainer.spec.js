import React from 'react';
import { mount } from 'enzyme';
import ImageContainer, { toRenderString } from './ImageContainer';
import { create, create_list, resetFactories } from '../../specs/spec-helpers';

jest.mock('../actions/ContainerActions');
const FakeContainerActions = require('../actions/ContainerActions');

jest.mock('../stores/TemplateSpecificationsStore', () => {
  let fakeMinReturn, fakeMaxReturn;
  function reset() {
    fakeMinReturn = 1;
    fakeMaxReturn = 10;
  }
  reset();
  return {
    getSpec: jest.fn(specName => {
      return specName === 'minImages' ? fakeMinReturn : fakeMaxReturn;
    }),
    __minImagesReturn: val => {fakeMinReturn = val;},
    __maxImagesReturn: val => {fakeMaxReturn = val;},
    __reset: reset
  }
});
const FakeTStore = require('../stores/TemplateSpecificationsStore');

const SWAP_BUTTON_SELECTOR = '.reactBasicTemplateEditor-ImageContainer-swapImageButton';
const REMOVE_BUTTON_SELECTOR = '.reactBasicTemplateEditor-ImageContainer-removeImageButton';
const ADD_BUTTON_SELECTOR = '.reactBasicTemplateEditor-ImageContainer-addImageButton';

// <ImageContainer
//   images={ [ arrayOfImages ] }
//   onUpdateImages={ () => {} }
// />

function getProps ( overrides ) {
  return create('imageContainerProps', {fieldName: 'myImageContainer'}, overrides);
}

describe('ImageContainer', () => {
  beforeEach(() => resetFactories());

  it('renders without crashing', () => {
    expect(() => {
      mount(<ImageContainer {...getProps()}/>);
    }).not.toThrow();
  });

  it('displays images', () => {
    let settings = {
      images: create_list('image', 2)
    };
    let component = mount(<ImageContainer {...getProps(settings)}/>);
    expect(component.find('img').length).toEqual(2);
  });

  it('displays only non-bank images to start', () => {
    let settings = {
      images: [
        create('image', {file: 'toast.jpg'}),
        create('image', {file: 'coffee.jpg'})
      ],
      imageBank: [
        'toast.jpg',
        'coffee.jpg',
        'eggs.jpg',
        'milk.jpg'
      ]
    };
    let component = mount(<ImageContainer {...getProps(settings)}/>);
    expect(component.find('img').length).toEqual(2);
  });

  describe('remove button', () => {
    beforeEach(FakeTStore.__reset);
    it('calls updateImages omitting the removed image', () => {
      let settings = {
        images: [
          create('image', {file: 'toast.jpg'}),
          create('image', {file: 'coffee.jpg'})
        ]
      };
      const component = mount(<ImageContainer {...getProps(settings)}/>);

      component.find(REMOVE_BUTTON_SELECTOR).at(0).simulate('click');

      expect(FakeContainerActions.changeContainer).toHaveBeenLastCalledWith('userImageChooser', 'myImageContainer', {'containedImages': [{'file': 'coffee.jpg', 'id': 1}]});
    });

    it('is not displayed if too few images', () => {
      let settings = {
        images: create_list('image', 2)
      };
      FakeTStore.__minImagesReturn(2);

      const component = mount(<ImageContainer {...getProps(settings)}/>);

      expect(component.find(REMOVE_BUTTON_SELECTOR).length).toEqual(0);
    });

    it('is displayed if enough images', () => {
      let settings = {
        images: create_list('image', 2)
      };
      FakeTStore.__minImagesReturn(1);

      const component = mount(<ImageContainer {...getProps(settings)}/>);

      expect(component.find(REMOVE_BUTTON_SELECTOR).length).toEqual(2);
    });
  });

  describe('add button', () => {
    beforeEach(FakeTStore.__reset);
    it('calls updateImages adding a new image', () => {
      const settings = {
        images: create_list('image', 2)
      };
      let expectedImages = settings.images.map((image, i) =>
        Object.assign({}, image, {id: i}));
      const component = mount(<ImageContainer {...getProps(settings)}/>);

      component.find(ADD_BUTTON_SELECTOR).at(0).simulate('click');

      expect(FakeContainerActions.changeContainer).toHaveBeenLastCalledWith('userImageChooser', 'myImageContainer', {'containedImages': [
        expectedImages[0], expectedImages[1], expectedImages[0]
      ]});
    });

    it('adds a new image without any captions', () => {
      let caption1 = create('caption', {value: 'something'});
      let caption2 = create('caption', caption1, {value: 'something else'});
      let blankCaption = create('caption', caption1, {value: ''});
      let settings = {
        images: [
          create('image', {captions:[ caption1 ]}),
          create('image', {captions:[ caption2 ]})
        ]
      }
      const component = mount(<ImageContainer {...getProps(settings)}/>);

      component.find(ADD_BUTTON_SELECTOR).at(0).simulate('click');

      expect(FakeContainerActions.changeContainer).toHaveBeenLastCalledWith(
        'userImageChooser',
        'myImageContainer',
        {'containedImages': [
          {'file': settings.images[0].file, 'id': 0, captions:[caption1]},
          {'file': settings.images[1].file, 'id': 1, captions:[caption2]},
          {'file': settings.images[0].file, 'id': 0, captions:[blankCaption]}
        ]
      });
    });

    it('is not displayed if enough images are present', () => {
      let settings = {
        images: create_list('image', 2)
      };
      FakeTStore.__maxImagesReturn(2);

      const component = mount(<ImageContainer {...getProps(settings)}/>);

      expect(component.find(ADD_BUTTON_SELECTOR).length).toEqual(0);
    });

    it('is displayed if few enough images', () => {
      let settings = {
        images: create_list('image', 2)
      };
      FakeTStore.__maxImagesReturn(3);

      const component = mount(<ImageContainer {...getProps(settings)}/>);

      expect(component.find(ADD_BUTTON_SELECTOR).length).toEqual(1);
    });
  });

  describe('swap button', () => {
    it('displays the image bank when the swap button is clicked', () => {
      pending(); // can no longer test until I figure out react-modal testing
      let settings = {
        images: [ create('image') ],
        imageBank: [
          'toast.jpg',
          'coffee.jpg',
          'eggs.jpg',
          'milk.jpg'
        ]
      };
      const component = mount(<ImageContainer {...getProps(settings)}/>);

      component.find(SWAP_BUTTON_SELECTOR).at(0).simulate('click');
      let renderedImages = component.render().find('img');

      expect(renderedImages.length).toEqual(4);
      settings.imageBank.map((val, i) => {
        expect(renderedImages.eq(i).attr('src')).toContain(val);
      });
    });

    it('swaps out the image when a new one is chosen', () => {
      pending(); // can no longer test until I figure out react-modal testing
      let settings = {
        images: [
          create('image', {file: 'toast.jpg'})
        ],
        imageBank: [
          'toast.jpg',
          'coffee.jpg',
          'eggs.jpg',
          'milk.jpg'
        ]
      };
      const component = mount(<ImageContainer {...getProps(settings)}/>);

      component.find(SWAP_BUTTON_SELECTOR).at(0).simulate('click');
      component.find('img').at(2).simulate('click');

      expect(FakeContainerActions.changeContainer).toHaveBeenLastCalledWith('userImageChooser', 'myImageContainer', {'containedImages': [{'file': 'eggs.jpg', 'id': 0}]});
    });

    describe('when the image bank has 1 image', () => {
      describe('and the bank image and chosen images are the same', () => {
        it('will not display the Change Image button', () => {
          let settings = {
            images: [
              create('image', {file: 'toast.jpg'})
            ],
            imageBank: [
              'toast.jpg'
            ]
          };
          const component = mount(<ImageContainer {...getProps(settings)}/>);

          expect(component.find(SWAP_BUTTON_SELECTOR).length).toEqual(0);
        });
      });
      describe('and the bank image and chosen images are different', () => {
        it('will still display the Change Image button', () => {
          pending();
          let settings = {
            images: [
              create('image', {file: 'toast.jpg'})
            ],
            imageBank: [
              'eggs.jpg'
            ]
          };
          const component = mount(<ImageContainer {...getProps(settings)}/>);

          expect(component.find(SWAP_BUTTON_SELECTOR).length).toEqual(1);
        });
      });
    });

  });


  describe('captions:', () => {
    let capSettings = () => {
      return {
        images: create_list('image', 2, {captions: [
          create('caption', {label: 'one'}),
          create('caption', {label: 'two'}),
          create('caption', {label: 'three'})
        ]})
      };
    }
    it('will show the correct number of caption fields', () => {
      let settings = capSettings();
      const component = mount(<ImageContainer {...getProps(settings)}/>);

      expect(component.find('input').length).toEqual(6);
    });

    it('will label the caption fields properly', () => {
      let settings = capSettings();
      const component = mount(<ImageContainer {...getProps(settings)}/>);

      expect(component.find('input').get(0).placeholder).toEqual('one');
      expect(component.find('input').get(1).placeholder).toEqual('two');
      expect(component.find('input').get(2).placeholder).toEqual('three');
    });

    describe('filter options', () => {
      describe('maxCharacters', () => {
        it('allows only last character typed if set to 1', () => {
          let captions = [
            create('caption', {label: 'one'}),
            create('caption', {label: 'two', settings: {maxCharacters: 1}}),
            create('caption', {label: 'three'})
          ];
          let settings = {
            images: [
              create('image', {file: 'toast.jpg'}, {captions})
            ]
          }

          const fakeEvent = {target:{value:'abcdefg'}};
          const component = mount(<ImageContainer {...getProps(settings)}/>);

          component.find('input').at(1).simulate('change', fakeEvent);

          expect(FakeContainerActions.changeContainer).toMatchSnapshot()
        });

        it('allows only first n characters when set to n > 1', () => {
          let captions = [
            create('caption', {label: 'one'}),
            create('caption', {label: 'two', settings: {maxCharacters: 3}}),
            create('caption', {label: 'three'})
          ];
          let settings = {
            images: [
              create('image', {file: 'toast.jpg'}, {captions})
            ]
          }
          const fakeEvent = {target:{value:'abcdefg'}};
          const component = mount(<ImageContainer {...getProps(settings)}/>);

          component.find('input').at(1).simulate('change', fakeEvent);

          expect(FakeContainerActions.changeContainer).toMatchSnapshot()
        });
      });
    });
  });

  describe('drop-downs:', () => {
    it('will show the correct number of drop-down fields', () => {
      const settings = {
        images: create_list('image', 2, {
          dropDowns: create_list('dropDown', 2)
        })
      }
      const component = mount(<ImageContainer {...getProps(settings)}/>);
      expect(component.find('select').length).toEqual(4);
    });

    it('will choose the proper option', () => {
      const images = [
        create('image', {dropDowns: create_list('dropDown', 2, {value: '1'})}),
        create('image', {dropDowns: create_list('dropDown', 2, {value: '2'})})
      ];
      images[1].dropDowns[1].value = '4';

      const component = mount(<ImageContainer {...getProps({images})}/>);

      expect(component.find('select').get(0).value).toEqual('1');
      expect(component.find('select').get(1).value).toEqual('1');
      expect(component.find('select').get(2).value).toEqual('2');
      expect(component.find('select').get(3).value).toEqual('4');
    });

    it('will send option changes up the stack', () => {
      const fakeChange = {target: {value: '2'}};
      const images = [
        create('image', {dropDowns: create_list('dropDown', 2, {value: '1'})})
      ];
      let expected = getProps({images});
      expected.images[0].dropDowns[0].value = '2';
      expected.images = expected.images.map((image, i) => {
        image.id = i; // add id to images because that happens somewhere
        return image;
      })
      const component = mount(<ImageContainer {...getProps({images})}/>);

      component.find('select').at(0).simulate('change', fakeChange);

      expect(FakeContainerActions.changeContainer).toHaveBeenLastCalledWith('userImageChooser', 'myImageContainer', {'containedImages': expected.images});
    });

  });

  describe('the toRenderString function behaves consistently', () => {
    it('when there are captions and drop downs', () => {
      let imageChooserObj = `{"maxImages":8,"minImages":3,
        "dropDowns":{"Which Kid?":{"default":"toffee","options":[{"name":"Rebel without an H","value":"jonny"},{"name":"Teenager in mourning","value":"toffee"}]}},
        "value":"",
        "containedImages":[
          {"file":"DonDentonAdmin_money.jpg","id":0,
            "captions":[
              {"label":"Top Text", "value": "something familair"},
              {"label":"Middle Text", "value": "somet", "settings": {"maxCharacters": 5}},
              {"label":"Bottom Text", "value": ""}
            ],"dropDowns":[
              {
                "label": "Which Kid?",
                "value": "1",
                "options": [
                  {"name":"Rebel without an H","value":"jonny"},
                  {"name":"Teenager in mourning","value":"toffee"}
                ]
              }
            ]
          },{"file":"DonDentonAdmin_hammer.jpg","id":1,
            "captions":[
              {"label":"Top Text", "value": ""},
              {"label":"Middle Text", "value": "", "settings": {"maxCharacters": 5}},
              {"label":"Bottom Text", "value": ""}
            ],
            "dropDowns":[
              {
                "label": "Which Kid?",
                "value": "2",
                "options": [
                  {"name":"Rebel without an H","value":"jonny"},
                  {"name":"Teenager in mourning","value":"toffee"}
                ]
              }
            ]
          },{"file":"DonDentonAdmin_tree.jpg","id":2,
            "captions":[
              {"label":"Top Text", "value": ""},
              {"label":"Middle Text", "value": "", "settings": {"maxCharacters": 5}},
              {"label":"Bottom Text", "value": ""}
            ],
            "dropDowns":[
              {
                "label": "Which Kid?",
                "value": "1",
                "options": [
                  {"name":"Rebel without an H","value":"jonny"},
                  {"name":"Teenager in mourning","value":"toffee"}
                ]
              }
            ]
          }
        ]
      }`;
      imageChooserObj = JSON.parse(imageChooserObj);

      expect(toRenderString(imageChooserObj)).toMatchSnapshot();
    });
    it('when there are captions without dropDowns', () => {
      let imageChooserObj = `{
        "maxImages":8,
        "minImages":3,
        "value":"",
        "containedImages":[
          {
            "file":"DonDentonAdmin_money.jpg","id":0,
            "captions":[
              {"label":"Top Text", "value": "something familair"},
              {"label":"Middle Text", "value": "somet", "settings": {"maxCharacters": 5}},
              {"label":"Bottom Text", "value": ""}
            ]
          },{
            "file":"DonDentonAdmin_hammer.jpg","id":1,
            "captions":[
              {"label":"Top Text", "value": ""},
              {"label":"Middle Text", "value": "", "settings": {"maxCharacters": 5}},
              {"label":"Bottom Text", "value": ""}
            ]
          },{
            "file":"DonDentonAdmin_tree.jpg","id":2,
            "captions":[
              {"label":"Top Text", "value": ""},
              {"label":"Middle Text", "value": "", "settings": {"maxCharacters": 5}},
              {"label":"Bottom Text", "value": ""}
            ]
          }
        ]
      }`;
      imageChooserObj = JSON.parse(imageChooserObj);

      expect(toRenderString(imageChooserObj)).toMatchSnapshot();
    });
    it('when there are no captions or dropDowns', () => {
      let imageChooserObj = '{"maxImages":8,"minImages":3,"value":"","containedImages":[{"file":"DonDentonAdmin_money.jpg","id":0},{"file":"DonDentonAdmin_hammer.jpg","id":1},{"file":"DonDentonAdmin_tree.jpg","id":2}]}';
      imageChooserObj = JSON.parse(imageChooserObj);

      expect(toRenderString(imageChooserObj)).toMatchSnapshot();
    });
  });

});
