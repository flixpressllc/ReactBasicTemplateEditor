require('jxon');
import Parser from './xml-parser';
import jsb from 'js-beautify';
import { XML_CONTAINER_ID } from '../stores/app-settings';

jest.mock('./dom-queries');

let pretty = (obj) => jsb.html(obj);

const startingTextOnlyXml = `<?xml version="1.0" encoding="utf-16"?>
<OrderRequestOfTextOnlyRndTemplate xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
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
</OrderRequestOfTextOnlyRndTemplate>`;

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
    "length": 3,
    "name": "Bunny Garden"
  },
  "resolutionId": 5
};

describe('Parser', () => {
  describe('getReactStartingData', () => {
    it('returns the expected object for a new TextOnly', () => {
      require('./dom-queries').__setMockElement(XML_CONTAINER_ID, {value: startingTextOnlyXml})
      expect(Parser.getReactStartingData()).toMatchSnapshot();
    });
  });
  describe('updateXmlForOrder', () => {
    it('updates the container with the expected values for new TextOnly', () => {
      let dom = require('./dom-queries');
      dom.__setMockElement(XML_CONTAINER_ID, {value: startingTextOnlyXml});

      Parser.updateXmlForOrder(mockOrderObjForTextOnly79);

      expect(pretty(dom.getElementById(XML_CONTAINER_ID).value)).toMatchSnapshot();
    });
  });
});
