import React from 'react';
import { mount } from 'enzyme';
import ImageContainer, { toRenderString } from './ImageContainer';
import { isObject } from 'happy-helpers';

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
    beforeEach(FakeTStore.__reset);
    it('calls updateImages omitting the removed image', () => {
      let settings = {
        images: [
          {file: 'toast.jpg'},
          {file: 'coffee.jpg'}
        ]
      };
      const component = mount(<ImageContainer {...getSettings(settings)}/>);

      component.find(REMOVE_BUTTON_SELECTOR).at(0).simulate('click');

      expect(FakeContainerActions.changeContainer).toHaveBeenLastCalledWith('userImageChooser', 'myImageContainer', {'containedImages': [{'file': 'coffee.jpg', 'id': 1}]});
    });

    it('is not displayed if too few images', () => {
      let settings = {
        images: [
          {file: 'toast.jpg'},
          {file: 'coffee.jpg'}
        ]
      };
      FakeTStore.__minImagesReturn(2);

      const component = mount(<ImageContainer {...getSettings(settings)}/>);

      expect(component.find(REMOVE_BUTTON_SELECTOR).length).toEqual(0);
    });

    it('is displayed if enough images', () => {
      let settings = {
        images: [
          {file: 'toast.jpg'},
          {file: 'coffee.jpg'}
        ]
      };

      const component = mount(<ImageContainer {...getSettings(settings)}/>);

      expect(component.find(REMOVE_BUTTON_SELECTOR).length).toEqual(2);
    });
  });

  describe('add button', () => {
    beforeEach(FakeTStore.__reset);
    it('calls updateImages adding a new image', () => {
      let settings = {
        images: [
          {file: 'toast.jpg'},
          {file: 'coffee.jpg'}
        ],
        imageBank: [
          'toast.jpg',
          'coffee.jpg'
        ]
      };
      const component = mount(<ImageContainer {...getSettings(settings)}/>);

      component.find(ADD_BUTTON_SELECTOR).at(0).simulate('click');

      expect(FakeContainerActions.changeContainer).toHaveBeenLastCalledWith('userImageChooser', 'myImageContainer', {'containedImages': [{'file': 'toast.jpg', 'id': 0},{'file': 'coffee.jpg', 'id': 1},{'file': 'toast.jpg', 'id': 0}]});
    });

    it('adds a new image without any captions', () => {
      let settings = {
        images: [
          {file: 'toast.jpg', captions:['cap','','']},
          {file: 'coffee.jpg', captions:['','','cap']}
        ],
        captions: [ 'one','two','three' ]
      }
      const component = mount(<ImageContainer {...getSettings(settings)}/>);

      component.find(ADD_BUTTON_SELECTOR).at(0).simulate('click');

      expect(FakeContainerActions.changeContainer).toHaveBeenLastCalledWith(
        'userImageChooser',
        'myImageContainer',
        {'containedImages': [
          {'file': 'toast.jpg', 'id': 0, captions:['cap','','']},
          {'file': 'coffee.jpg', 'id': 1, captions:['','','cap']},
          {'file': 'toast.jpg', 'id': 0, captions:['','','']}
        ]
      });
    });

    it('is not displayed if enough images are present', () => {
      let settings = {
        images: [
          {file: 'toast.jpg'},
          {file: 'coffee.jpg'}
        ]
      };
      FakeTStore.__maxImagesReturn(2);

      const component = mount(<ImageContainer {...getSettings(settings)}/>);

      expect(component.find(ADD_BUTTON_SELECTOR).length).toEqual(0);
    });

    it('is displayed if few enough images', () => {
      let settings = {
        images: [
          {file: 'toast.jpg'},
          {file: 'coffee.jpg'}
        ]
      };

      const component = mount(<ImageContainer {...getSettings(settings)}/>);

      expect(component.find(ADD_BUTTON_SELECTOR).length).toEqual(1);
    });
  });

  describe('swap button', () => {
    it('displays the image bank when the swap button is clicked', () => {
      pending(); // can no longer test until I figure out react-modal testing
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

      component.find(SWAP_BUTTON_SELECTOR).at(0).simulate('click');
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

        expect(component.find(SWAP_BUTTON_SELECTOR).length).toEqual(0);
      });
    });

  });


  describe('captions:', () => {
    let capSettings = () => {
      return {
        images: [
          {file: 'toast.jpg', captions:[
            {label: 'one', value: ''},
            {label: 'two', value: ''},
            {label: 'three', value: ''}
          ]},
          {file: 'coffee.jpg', captions:[
            {label: 'one', value: ''},
            {label: 'two', value: ''},
            {label: 'three', value: ''}
          ]}
        ]
      };
    }
    it('will show the correct number of caption fields', () => {
      let settings = capSettings();
      const component = mount(<ImageContainer {...getSettings(settings)}/>);

      expect(component.find('input').length).toEqual(6);
    });

    it('will label the caption fields properly', () => {
      let settings = capSettings();
      const component = mount(<ImageContainer {...getSettings(settings)}/>);

      expect(component.find('input').get(0).placeholder).toEqual('one');
      expect(component.find('input').get(1).placeholder).toEqual('two');
      expect(component.find('input').get(2).placeholder).toEqual('three');
    });

    xit('will allow for an object with settings as the main captions directive', () => {
      let settings = {
        images: [ {file: 'toast.jpg', captions:['','','']}, {file: 'coffee.jpg', captions:['','','']} ],
        captions: [
          'one',
          { label: 'two', settings: {maxCharacters: 3} },
          'three'
        ]
      }
      const component = mount(<ImageContainer {...getSettings(settings)}/>);

      expect(component.find('input').get(1).placeholder).toEqual('two');
    });

    xdescribe('filter options', () => {
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

  describe('drop-downs:', () => {
    let ddSettings = () => {return {
      images: [
        {file: 'lockers.jpg', dropDowns:[
          {
            label: 'Which Girl?',
            options: [
              {name: 'toffee', value: '1'},
              {name: 'candy', value: '2'},
              {name: 'ginger', value: '3'},
              {name: 'coco', value: '4'}
            ],
            value: '1'
          },
          {
            label: 'Which Boy?',
            options: [
              {name: 'jonny', value: '1'},
              {name: 'jake', value: '2'},
              {name: 'josh', value: '3'},
              {name: 'joey', value: '4'}
            ],
            value: '1'
          }
        ]}, {file: 'prom.jpg', dropDowns:[
          {
            label: 'Which Girl?',
            options: [
              {name: 'toffee', value: '1'},
              {name: 'candy', value: '2'},
              {name: 'ginger', value: '3'},
              {name: 'coco', value: '4'}
            ],
            value: '2'
          },
          {
            label: 'Which Boy?',
            options: [
              {name: 'jonny', value: '1'},
              {name: 'jake', value: '2'},
              {name: 'josh', value: '3'},
              {name: 'joey', value: '4'}
            ],
            value: '4'
          }
        ]}
      ]
    }}
    it('will show the correct number of drop-down fields', () => {
      const component = mount(<ImageContainer {...getSettings(ddSettings())}/>);
      expect(component.find('select').length).toEqual(4);
    });

    it('will choose the proper option', () => {
      const component = mount(<ImageContainer {...getSettings(ddSettings())}/>);
      expect(component.find('select').get(0).value).toEqual('1');
      expect(component.find('select').get(1).value).toEqual('1');
      expect(component.find('select').get(2).value).toEqual('2');
      expect(component.find('select').get(3).value).toEqual('4');
    });

    it('will send option changes up the stack', () => {
      const fakeChange = {target: {value: '2'}};
      const component = mount(<ImageContainer {...getSettings(ddSettings())}/>);
      let expected = ddSettings();
      expected.images[0].dropDowns[0].value = '2';
      expected.images = expected.images.map((image, i) => {
        image.id = i; // add id to images because that happens somewhere
        return image;
      })

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
