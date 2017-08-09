import * as DataAdapter from './renderDataAdapter';
import jsb from 'js-beautify';
import { XML_CONTAINER_ID, IMAGES_CONTAINER_ID } from '../stores/app-settings';
import { getSubmissionXmlFor, getMockOrderObject } from '../../specs/spec-helpers';

jest.mock('./dom-queries');

// make it pretty and make self-terminating tags consistent ( <This /> versus <This/> )
let pretty = (obj) => jsb.html(obj).replace(/(\S)\/>/g, '$1 />');

const startingTextOnlyXml = getSubmissionXmlFor('startingTextOnly');

const startingImagesXml = getSubmissionXmlFor('startingImages');

const startingImagesCroppedImagesFormFieldValue = 'HiddenFieldImage1.png|HiddenFieldImage2.jpg|HiddenFieldImage3.png|';

describe('DataAdapter', () => {
  describe('getReactStartingData', () => {
    it('returns the expected object for a new TextOnly', () => {
      require('./dom-queries').__setMockElement(XML_CONTAINER_ID, {value: startingTextOnlyXml});
      expect(DataAdapter.getReactStartingData()).toMatchSnapshot();
    });
    it('returns the expected object for a previously created TextOnly', () => {
      require('./dom-queries').__setMockElement(XML_CONTAINER_ID, {value: getSubmissionXmlFor(79)});
      expect(DataAdapter.getReactStartingData()).toMatchSnapshot();
    });

    it('returns the expected object for a new Images template', () => {
      let dom = require('./dom-queries');
      dom.__setMockElement(XML_CONTAINER_ID, {value: startingImagesXml});
      dom.__setMockElement(IMAGES_CONTAINER_ID, {value: startingImagesCroppedImagesFormFieldValue});
      expect(DataAdapter.getReactStartingData()).toMatchSnapshot();
    });
    describe('when starting with a previous render', () => {
      describe('and when images contain captions', () => {
        it('returns the expected object', () => {
          let dom = require('./dom-queries');
          dom.__setMockElement(IMAGES_CONTAINER_ID, {value: ''});
          dom.__setMockElement(XML_CONTAINER_ID, {value: getSubmissionXmlFor(92)});
          expect(DataAdapter.getReactStartingData()).toMatchSnapshot();
        });
      });
      describe('and when images do not contain captions', () => {
        it('returns the expected object', () => {
          let dom = require('./dom-queries');
          dom.__setMockElement(IMAGES_CONTAINER_ID, {value: ''});
          dom.__setMockElement(XML_CONTAINER_ID, {value: getSubmissionXmlFor(96)});
          expect(DataAdapter.getReactStartingData()).toMatchSnapshot();
        });
      });
    });

    it('does not return duplicate images from hidden field and captions in the imageBank container', () => {
      pending();

      expect();
    });
  });

  describe('updateXmlForOrder', () => {
    it('updates the container with the expected values for new TextOnly', () => {
      let dom = require('./dom-queries');
      dom.__setMockElement(XML_CONTAINER_ID, {value: startingTextOnlyXml});

      DataAdapter.updateXmlForOrder( getMockOrderObject(79));

      expect(pretty(dom.getElementById(XML_CONTAINER_ID).value)).toEqual(pretty(getSubmissionXmlFor(79)));
    });
    it('updates the container with the expected values for new Images', () => {
      let dom = require('./dom-queries');
      dom.__setMockElement(XML_CONTAINER_ID, {value: startingImagesXml});
      let expected = pretty(getSubmissionXmlFor(2000));

      DataAdapter.updateXmlForOrder(getMockOrderObject(2000));
      let result = pretty(dom.getElementById(XML_CONTAINER_ID).value);

      expect(result).toEqual(expected);
    });
  });

  describe('private functions', () => {
    describe('getImagesFromUnusedRenderData', () => {
      const getImagesFromUnusedRenderData = DataAdapter._private.getImagesFromUnusedRenderData;
      function prepObj (data) {
        return {RenderedData: {UnusedImageUrls: {String: data}}};
      }
      describe('when given an empty object', () => {
        it('returns an empty array', () => {
          let obj = prepObj(null);
          expect(getImagesFromUnusedRenderData(obj)).toEqual([]);
        });
      });
      describe('when given a string', () => {
        it('returns an array containing the string', () => {
          let obj = prepObj('string');
          expect(getImagesFromUnusedRenderData(obj)).toEqual(['string']);
        });
      });
      describe('when given an array', () => {
        it('returns the array', () => {
          let obj = prepObj(['array', 'of', 'strings']);
          expect(getImagesFromUnusedRenderData(obj)).toEqual(['array', 'of', 'strings']);
        });
      });
    });
  });
});
