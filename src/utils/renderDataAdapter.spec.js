import * as DataAdapter from './renderDataAdapter';
import jsb from 'js-beautify';
import { XML_CONTAINER_ID, IMAGES_CONTAINER_ID,
  TOP_LEVEL_NAME_IMAGES, TOP_LEVEL_NAME_TEXT_ONLY } from '../stores/app-settings';
import { getSubmissionXmlFor } from '../../specs/spec-helpers';

jest.mock('./dom-queries');

let pretty = (obj) => jsb.html(obj);

const startingTextOnlyXml = `<?xml version="1.0" encoding="utf-16"?>
<${TOP_LEVEL_NAME_TEXT_ONLY} xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<ResolutionId>0</ResolutionId>
<IsPreview>false</IsPreview>
<ResolutionOptions>
  <ListItemViewModel>
    <Id>5</Id>
    <Name>720p</Name>
  </ListItemViewModel>
  <ListItemViewModel>
    <Id>3</Id>
    <Name>1080p</Name>
  </ListItemViewModel>
  <ListItemViewModel>
    <Id>4</Id>
    <Name>4K</Name>
  </ListItemViewModel>
</ResolutionOptions>
</${TOP_LEVEL_NAME_TEXT_ONLY}>`;

const startingImagesXml = `<?xml version="1.0" encoding="utf-16"?>
<${TOP_LEVEL_NAME_IMAGES} xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<ResolutionId>0</ResolutionId>
<IsPreview>false</IsPreview>
<ResolutionOptions>
  <ListItemViewModel>
    <Id>5</Id>
    <Name>720p</Name>
  </ListItemViewModel>
  <ListItemViewModel>
    <Id>3</Id>
    <Name>1080p</Name>
  </ListItemViewModel>
  <ListItemViewModel>
    <Id>4</Id>
    <Name>4K</Name>
  </ListItemViewModel>
</ResolutionOptions>
</${TOP_LEVEL_NAME_IMAGES}>`;

const startingImagesCroppedImagesFormFieldValue = 'DonDentonAdmin_1-23-2017_94956756.png|DonDentonAdmin_1-23-2017_9502787.jpg|DonDentonAdmin_1-23-2017_9505506.png|';

const previousTextOnlyXml =  getSubmissionXmlFor(79);

const mockOrderObjForTextOnly79 = {
  "ui": [
    {
      "Customize Icon": [
        {
          "type": "DropDown",
          "name": "Icon Style",
          "value": "camera"
        },
        {
          "type": "TextField",
          "name": "Icon Character - type in only one (optional)",
          "value": "q"
        }
      ]
    },
    {
      "Customize Look": [
        {
          "type": "DropDown",
          "name": "Background",
          "value": "camo"
        },
        {
          "type": "DropDown",
          "name": "Icon Color",
          "value": "icon_pink"
        },
        {
          "type": "DropDown",
          "name": "Main Text Color",
          "value": "main_orange"
        },
        {
          "type": "DropDown",
          "name": "Subtitle Text Color",
          "value": "sub_white"
        }
      ]
    },
    {
      "Customize Text": [
        {
          "type": "TextField",
          "name": "Text Left of Icon",
          "value": "Left"
        },
        {
          "type": "TextField",
          "name": "Text Right of Icon",
          "value": "Right"
        },
        {
          "type": "TextField",
          "name": "Subtitle",
          "value": "Bottom"
        }
      ]
    }
  ],
  "isPreview": true,
  "audioInfo": {
    "audioType": "StockAudio",
    "audioUrl": "https://fpsound.s3.amazonaws.com/13.mp3",
    "id": 13,
    "length": 0,
    "name": "Bunny Garden"
  },
  "resolutionId": 3,
  "resolutionOptions": [
    { "id": 5, "name": "720p" },
    { "id": 3, "name": "1080p" },
  ]
};

const mockOrderObjForTextOnly89 = {
  "ui": [
    {
      "Customize Icon": [
        {
          "type": "DropDown",
          "name": "Icon Style",
          "value": "camera"
        },
        {
          "type": "TextField",
          "name": "Icon Character - type in only one (optional)",
          "value": "q"
        }
      ]
    },
    {
      "Customize Look": [
        {
          "type": "DropDown",
          "name": "Background",
          "value": "camo"
        },
        {
          "type": "DropDown",
          "name": "Icon Color",
          "value": "icon_pink"
        },
        {
          "type": "DropDown",
          "name": "Main Text Color",
          "value": "main_orange"
        },
        {
          "type": "DropDown",
          "name": "Subtitle Text Color",
          "value": "sub_white"
        }
      ]
    },
    {
      "Customize Text": [
        {
          "type": "TextField",
          "name": "Text Left of Icon",
          "value": "Left"
        },
        {
          "type": "TextField",
          "name": "Text Right of Icon",
          "value": "Right"
        },
        {
          "type": "TextField",
          "name": "Subtitle",
          "value": "Bottom"
        }
      ]
    }
  ],
  "isPreview": true,
  "audioInfo": {
    "audioType": "StockAudio",
    "audioUrl": "https://fpsound.s3.amazonaws.com/13.mp3",
    "id": 13,
    "length": 3,
    "name": "Bunny Garden"
  },
  "resolutionId": 5
};

describe('DataAdapter', () => {
  describe('getReactStartingData', () => {
    it('returns the expected object for a new TextOnly', () => {
      require('./dom-queries').__setMockElement(XML_CONTAINER_ID, {value: startingTextOnlyXml});
      expect(DataAdapter.getReactStartingData()).toMatchSnapshot();
    });
    it('returns the expected object for a previously created TextOnly', () => {
      require('./dom-queries').__setMockElement(XML_CONTAINER_ID, {value: previousTextOnlyXml});
      expect(DataAdapter.getReactStartingData()).toMatchSnapshot();
    });

    it('returns the expected object for a new Images template', () => {
      let dom = require('./dom-queries');
      dom.__setMockElement(XML_CONTAINER_ID, {value: startingImagesXml});
      dom.__setMockElement(IMAGES_CONTAINER_ID, {value: startingImagesCroppedImagesFormFieldValue});
      expect(DataAdapter.getReactStartingData()).toMatchSnapshot();
    });
  });
  describe('updateXmlForOrder', () => {
    fit('updates the container with the expected values for new TextOnly', () => {
      let dom = require('./dom-queries');
      dom.__setMockElement(XML_CONTAINER_ID, {value: startingTextOnlyXml});

      DataAdapter.updateXmlForOrder(mockOrderObjForTextOnly79);

      expect(pretty(dom.getElementById(XML_CONTAINER_ID).value)).toEqual(pretty(getSubmissionXmlFor(79)));
    });
    it('updates the container with the expected values for new Images', () => {
      let dom = require('./dom-queries');
      dom.__setMockElement(XML_CONTAINER_ID, {value: startingImagesXml});

      DataAdapter.updateXmlForOrder(mockOrderObjForTextOnly89);

      expect(pretty(dom.getElementById(XML_CONTAINER_ID).value)).toEqual(pretty(getSubmissionXmlFor(92)));
    });
  });
});
