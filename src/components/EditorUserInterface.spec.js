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
    isChargePerOrder: false,
    renderCost: 8
  }
};}

function baseMockReturnForGetStartingData () { return [{
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
}];}

function imagesMockReturnForGetStartingData () {
  return [Object.assign({}, baseMockReturnForGetStartingData()[0], {
    imageBank: [
      'DonDentonAdmin_1-23-2017_94956756.png',
      'DonDentonAdmin_1-23-2017_9502787.jpg',
      'DonDentonAdmin_1-23-2017_9505506.png'
    ]
  }),{}];
}

function baseMockReturnForGetStartingDataOffPreview () { return [
  {
    "audioInfo": {
      "audioType": "StockAudio",
      "audioUrl": "https://fpsound.s3.amazonaws.com/13.mp3",
      "id": 13,
      "length": 3,
      "name": "Bunny Garden",
    },
    "isPreview": true,
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
  },
  {
    'Icon Style': 'camera',
    'Icon Character - type in only one (optional)': 'q',
    'YT1': 'The Office Audition Tapes For Dwight, Michael, Kevin, Pam and Jim|S73Nzksy6rU|',
    'Icon Color': 'icon_pink',
    'Main Text Color': '100.100.0',
    'Subtitle Text Color': '0.0.0.50',
    'Text Left of Icon': 'Left',
    'Text Right of Icon': 'Right',
    'Subtitle': 'Bottom',
  }
];}

function imagesMockReturnForGetStartingDataOffPreview () { return [
  {
    audioInfo: {
      audioType: 'StockAudio',
      audioUrl: 'https://fpsound.s3.amazonaws.com/13.mp3',
      id: 13,
      length: 3,
      name: 'Bunny Garden',
    },
    isPreview: true,
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
  },
  {
    'Text Left of Icon': 'Left',
    'Text Right of Icon': 'Right',
    ImageContainer: [ // This name will be wrong if we ever assume more than one
      {
        captions: [ 'marmet' ],
        file: 'DonDentonAdmin_1-23-2017_94956756.png',
      },
      {
        captions: [''],
        file: 'DonDentonAdmin_1-23-2017_9502787.jpg',
      },
      {
        captions: [''],
        file: 'DonDentonAdmin_1-23-2017_9505506.png',
      }
    ]
  }
];}

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
