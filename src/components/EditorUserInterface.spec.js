import React from 'react';
import { shallow } from 'enzyme';
import EditorUserInterface from './EditorUserInterface';

jest.mock('../utils/renderDataAdapter');

jest.mock('../utils/ajax');
const ajax = require('../utils/ajax');
ajax.getJSON = (path) => {
  return new Promise ((resolve, reject) => {
    require('jsonfile').readFile('./src' + path, (err, obj) => {
      if (err) reject(err);
      resolve({data: obj});
    });
  });
};

function generalSettings () { return {
  uiSettingsJsonUrl: '/templates/Template1000.json',
  templateType: 'text',
  userSettingsData: {
    username: 'DonDenton',
    templateId: 1000,
    minutesRemainingInContract: 170.2819,
    minimumTemplateDuration: 0.1667,
    previewVideoUrl: '',
    isChargePerOrder: false,
    renderCost: 8
  }
};}

function generalImagesTemplateSettings () { return {
  uiSettingsJsonUrl: '/templates/Template2000.json',
  templateType: 'images',
  userSettingsData: {
    username: 'DonDenton',
    templateId: 2000,
    minutesRemainingInContract: 170.2819,
    minimumTemplateDuration: 0.1667,
    previewVideoUrl: '',
    isChargePerOrder: false,
    renderCost: 8
  }
};}

function baseMockReturnForGetStartingData () { return {
  isPreview: false,
  resolutionId: 0,
  resolutions: [
    {
      id: 5,
      name: '720p',
    },
    {
      id: 3,
      name: '1080p',
    },
    {
      id: 4,
      name: '4K',
    },
  ],
  audioInfo: {
    audioType: 'NoAudio',
    audioUrl: '',
    id: 0,
    length: 0,
    name: '',
  }
};}

function imagesMockReturnForGetStartingData () {
  return Object.assign({}, baseMockReturnForGetStartingData(), {
    imageBank: [
      'DonDentonAdmin_1-23-2017_94956756.png',
      'DonDentonAdmin_1-23-2017_9502787.jpg',
      'DonDentonAdmin_1-23-2017_9505506.png'
    ]
  });
}

function baseMockReturnForGetStartingDataOffPreview () { return {
  "audioInfo": {
    "audioType": "StockAudio",
    "audioUrl": "https://fpsound.s3.amazonaws.com/13.mp3",
    "id": 13,
    "length": 3,
    "name": "Bunny Garden",
  },
  "isPreview": true,
  "nameValuePairs": [
    {
      "name": "Icon Style",
      "value": "camera",
    },
    {
      "name": "Icon Character - type in only one (optional)",
      "value": "q",
    },
    {
      "name": "YT1",
      "value": "The Office Audition Tapes For Dwight, Michael, Kevin, Pam and Jim|S73Nzksy6rU|",
    },
    {
      "name": "Icon Color",
      "value": "icon_pink",
    },
    {
      "name": "Main Text Color",
      "value": "100.100.0",
    },
    {
      "name": "Subtitle Text Color",
      "value": "0.0.0.50",
    },
    {
      "name": "Text Left of Icon",
      "value": "Left",
    },
    {
      "name": "Text Right of Icon",
      "value": "Right",
    },
    {
      "name": "Subtitle",
      "value": "Bottom",
    },
  ],
  "resolutionId": 5,
  "resolutions": [
    {
      "id": 5,
      "name": "720p",
    },
    {
      "id": 3,
      "name": "1080p",
    },
  ]
};}

function imagesMockReturnForGetStartingDataOffPreview () { return {
  audioInfo: {
    audioType: 'StockAudio',
    audioUrl: 'https://fpsound.s3.amazonaws.com/13.mp3',
    id: 13,
    length: 3,
    name: 'Bunny Garden',
  },
  isPreview: true,
  nameValuePairs: [
    {
      name: 'Text Left of Icon',
      value: 'Left',
    },
    {
      name: 'Text Right of Icon',
      value: 'Right',
    },
    {
      name: 'ImageContainer', // This will be wrong if we ever assume more than one
      value: [
        {
          caption: 'marmet',
          file: 'DonDentonAdmin_1-23-2017_94956756.png',
        },
        {
          caption: '',
          file: 'DonDentonAdmin_1-23-2017_9502787.jpg',
        },
        {
          caption: '',
          file: 'DonDentonAdmin_1-23-2017_9505506.png',
        }
      ]
    }
  ],
  resolutionId: 5,
  resolutions: [
    {
      id: 5,
      name: '720p',
    },
    {
      id: 3,
      name: '1080p',
    },
  ]
};}

describe('EditorUserInterface', () => {
  it('renders without crashing', () => {
    const settings = generalSettings();
    expect(() => {
      shallow(<EditorUserInterface {...settings}/>);
    }).not.toThrow();
  });

  describe('when text only', () => {
    describe('and when starting fresh', () => {
      it('prepares the data for order as expected', () => {
        let settings = generalSettings();
        let renderDataAdapter = require('../utils/renderDataAdapter');
        renderDataAdapter.updateXmlForOrder.mockImplementation(() => {});
        renderDataAdapter.getReactStartingData.mockImplementation(() => baseMockReturnForGetStartingData() );
        const component = shallow(<EditorUserInterface {...settings}/>);

        return component.instance().setupEditor().then(() => {
          component.instance().handlePlaceOrder();

          let numCalls = renderDataAdapter.updateXmlForOrder.mock.calls.length;
          expect(renderDataAdapter.updateXmlForOrder.mock.calls[numCalls - 1]).toMatchSnapshot();
        });
      });
    });
    describe('and when starting with a preview', () => {
      it('prepares the data for order as expected', () => {
        let settings = generalSettings();
        let renderDataAdapter = require('../utils/renderDataAdapter');
        renderDataAdapter.updateXmlForOrder.mockImplementation(() => {});
        renderDataAdapter.getReactStartingData.mockImplementation(() => baseMockReturnForGetStartingDataOffPreview() );
        const component = shallow(<EditorUserInterface {...settings}/>);

        return component.instance().setupEditor().then(() => {
          component.instance().handlePlaceOrder();

          let numCalls = renderDataAdapter.updateXmlForOrder.mock.calls.length;
          expect(renderDataAdapter.updateXmlForOrder.mock.calls[numCalls - 1]).toMatchSnapshot();
        });
      });
    });
  });

  describe('when an images template', () => {
    describe('and when starting fresh', () => {
      it('passes the info into the correct containers', () => {
        let settings = generalImagesTemplateSettings();
        let renderDataAdapter = require('../utils/renderDataAdapter');
        renderDataAdapter.updateXmlForOrder.mockImplementation(() => {});
        renderDataAdapter.getReactStartingData.mockImplementation(() => imagesMockReturnForGetStartingData() );
        const component = shallow(<EditorUserInterface {...settings}/>);

        return component.instance().setupEditor().then(() => {
          let containedImages = component.state().userImageChoosers['Your Two Images'].containedImages;

          let expected = [
            {id: 0, file: 'DonDentonAdmin_1-23-2017_94956756.png'},
            {id: 1, file: 'DonDentonAdmin_1-23-2017_9502787.jpg'},
            {id: 2, file: 'DonDentonAdmin_1-23-2017_9505506.png'},

          ]

          expect(containedImages).toEqual(expected);
        });
      });
      it('prepares the data for order as expected', () => {
        let settings = generalImagesTemplateSettings();
        let renderDataAdapter = require('../utils/renderDataAdapter');
        renderDataAdapter.updateXmlForOrder.mockImplementation(() => {});
        renderDataAdapter.getReactStartingData.mockImplementation(() => imagesMockReturnForGetStartingData() );
        const component = shallow(<EditorUserInterface {...settings}/>);

        return component.instance().setupEditor().then(() => {
          component.instance().handlePlaceOrder();

          let numCalls = renderDataAdapter.updateXmlForOrder.mock.calls.length;
          expect(renderDataAdapter.updateXmlForOrder.mock.calls[numCalls - 1]).toMatchSnapshot();
        });
      });
    });

    describe('and when starting from preview', () => {
      it('passes the info into the correct containers', () => {
        let settings = generalImagesTemplateSettings();
        let renderDataAdapter = require('../utils/renderDataAdapter');
        renderDataAdapter.updateXmlForOrder.mockImplementation(() => {});
        renderDataAdapter.getReactStartingData.mockImplementation(() => imagesMockReturnForGetStartingDataOffPreview() );
        const component = shallow(<EditorUserInterface {...settings}/>);

        return component.instance().setupEditor().then(() => {
          let containedImages = component.state().userImageChoosers['Your Two Images'].containedImages;
          expect(containedImages).toMatchSnapshot();
        });
      });
      it('prepares the data for order as expected', () => {
        let settings = generalImagesTemplateSettings();
        let renderDataAdapter = require('../utils/renderDataAdapter');
        renderDataAdapter.updateXmlForOrder.mockImplementation(() => {});
        renderDataAdapter.getReactStartingData.mockImplementation(() => imagesMockReturnForGetStartingDataOffPreview() );
        const component = shallow(<EditorUserInterface {...settings}/>);

        return component.instance().setupEditor().then(() => {
          component.instance().handlePlaceOrder();

          let numCalls = renderDataAdapter.updateXmlForOrder.mock.calls.length;
          expect(renderDataAdapter.updateXmlForOrder.mock.calls[numCalls - 1]).toMatchSnapshot();
        });
      });
    });
  });
});
