import jxon from './xmlAdapter';
import { XML_CONTAINER_ID } from '../stores/app-settings';
import { getElementById } from './dom-queries';
import  Deferred  from './deferred';
import { clone, convertPropKeysForJs, convertPropKeysForAsp, isEmpty,
  nestedPropertyTest, isObject, isNotEmpty, wrapObjectWithProperty } from './helper-functions';

// The next comment line will tell JSHint to ignore double quotes for a bit
/* eslint-disable quotes */
var startingPoint = {
  "$xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
  "$xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
  ResolutionId: 0,
  RenderedData: {
    Specs: {
      $name: "Specs",
      $val: "",
      SpCx: {
        CSp: []
      }
    },
    AudioInfo: {
      Name: null,
      Length: "0",
      AudioType: "NoAudio",
      Id: "0",
      AudioUrl: null
    }
  },
  IsPreview: false
};
/* eslint-enable quotes */

function xmlContainerDiv () {
  return getElementById(XML_CONTAINER_ID);
}

function getXmlContainerValue () {
  return xmlContainerDiv().value;
}

function setXmlContainerValue (value) {
  xmlContainerDiv().value = value;
}

var getLoadedXmlAsString = function () {
  return getXmlContainerValue();
};

var getLoadedXmlAsObject = function () {
  return jxon.stringToJs(getLoadedXmlAsString());
};

var getTopLevelXmlName = function () {
  return 'OrderRequestOfTextOnlyRndTemplate';
};


var convertSpecsToReactData = function (givenXmlObj) {
  if (!nestedPropertyTest(givenXmlObj,'RenderedData.Specs.SpCx.CSp', Array.isArray)) {
    return {};
  }
  let specs = clone(givenXmlObj.RenderedData.Specs.SpCx.CSp);

  let nameValuePairs = [];
  for (var i = 0; i < specs.length; i++) {
    var currentFieldsArray = specs[i].SpCx.Sp;
    var name = '';
    var value = '';
    for ( var j = 0; currentFieldsArray.length > j; j++ ) {
      name = currentFieldsArray[j].$name;
      value = currentFieldsArray[j].$val;
      nameValuePairs.push({name: name, value: value});
    }
  }

  return {nameValuePairs};
};

function getStartingResolutionsObject (obj) {
  if (!nestedPropertyTest(obj, 'ResolutionOptions.ListItemViewModel', isNotEmpty)) {
    throw new Error('No resolutions available');
  }

  let givenResolutions = clone(obj.ResolutionOptions.ListItemViewModel);

  // jxon will only create an array if there is more than one value.
  // We want an array every time.
  if (givenResolutions.length === undefined) {
    givenResolutions = [givenResolutions];
  }

  // Eventual refactor for arrays of Objects?
  let resolutions = []
  for (let i=0; i < givenResolutions.length; i++) {
    resolutions.push(convertPropKeysForJs(givenResolutions[i]));
  }

  return {resolutions: resolutions, resolutionId: resolutions[0].id};
}

function getStartingAudioObject (obj) {
  if (nestedPropertyTest(obj, 'RenderedData.AudioInfo', isObject)) {
    return {audioInfo: convertPropKeysForJs(obj.RenderedData.AudioInfo)};
  }
  return {};
}

function getReactStartingData () {
  let obj = getLoadedXmlAsObject()[getTopLevelXmlName()];

  let specsObj = convertSpecsToReactData(obj);
  let resolutionsObj = getStartingResolutionsObject(obj);
  let audioDataObj = getStartingAudioObject(obj);
  let isPreviewObj = {isPreview: obj.IsPreview};

  return Object.assign({}, specsObj, resolutionsObj, audioDataObj, isPreviewObj);
}

function objectToXml (object) {
  return '<?xml version="1.0" encoding="utf-16"?>\n' + jxon.jsToString(object);
}

function addResolutionToOrderObj (orderObj, reactObj) {
  if (reactObj.resolutionId === undefined || reactObj.resolutionId === 0) {
    throw new Error('No ResolutionId was present');
  }
  let newOrderObj = clone(orderObj);
  newOrderObj.ResolutionId = reactObj.resolutionId;
  return newOrderObj;
}

function addAudioToOrderObj (orderObj, reactObj) {
  let newOrderObj = clone(orderObj);
  // copy audio
  if (reactObj.audioInfo === undefined) {
    throw new Error('No audioInfo was present');
  }
  newOrderObj.RenderedData.AudioInfo = convertPropKeysForAsp(reactObj.audioInfo);
  return newOrderObj;
}

function addSpecsToOrderObj (orderObj, reactObj) {
  let newOrderObj = clone(orderObj);
  // Distribute Specs
  if (reactObj.ui === undefined) {
    throw new Error('No Specs were sent');
  }
  for (var i = 0; i < reactObj.ui.length; i++) {

    for (var key in reactObj.ui[i]) {
      if (reactObj.ui[i].hasOwnProperty(key)){
        var SpArray = [];

        for (var j = 0; j < reactObj.ui[i][key].length; j++) {
           SpArray.push({
            $name: reactObj.ui[i][key][j].name,
            $val: reactObj.ui[i][key][j].value
          });
        }

        newOrderObj.RenderedData.Specs.SpCx.CSp.push({
          $name: key,
          $val: 'CD|' + key + '|',
          SpCx: {
            Sp: SpArray
          }
        });

      }
    }

  }
  return newOrderObj;
}

function updateXmlForOrder (reactObj) {
  var promise = Deferred();
  var orderObject = clone(startingPoint);

  orderObject = addResolutionToOrderObj(orderObject, reactObj);
  orderObject = addAudioToOrderObj(orderObject, reactObj);
  orderObject = addSpecsToOrderObj(orderObject, reactObj);
  orderObject.IsPreview = reactObj.isPreview;

  orderObject = wrapObjectWithProperty(orderObject, getTopLevelXmlName());
  setXmlContainerValue( objectToXml(orderObject) );
  promise.resolve();

  return promise;
};

export default {
  getReactStartingData,
  updateXmlForOrder
};
