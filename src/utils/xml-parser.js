import jxon from './xmlAdapter';
import { XML_CONTAINER_ID } from '../stores/app-settings';
import { getElementById } from './dom-queries';
import  Deferred  from './deferred';
import {clone} from './helper-functions';

// The next comment line will tell JSHint to ignore double quotes for a bit
/* eslint-disable quotes */
var startingPoint = {
  OrderRequestOfTextOnlyRndTemplate: {
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
  }
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

function changePropsInitialCase (obj, whichCase) {
  var makeAspVersion = (whichCase === 'UpperFirst') ? true : false ;
  var newObject = obj;
  if (makeAspVersion) {
    var regex = /[a-z]/;
  } else {
    var regex = /[A-z]/;
  }
  for (var key in newObject) {
    if (newObject.hasOwnProperty(key) === false) continue;
    if (typeof key !== 'string') continue;
    if (key.charAt(0).match(regex) === null) continue;

    var prop = newObject[key];
    var newName = '';
    if (makeAspVersion){
      newName = key.charAt(0).toUpperCase() + key.slice(1);
    } else {
      newName = key.charAt(0).toLowerCase() + key.slice(1);
    }
    delete newObject[key];
    newObject[newName] = prop;
  }
  return newObject;
}


var convertSpecsToReactData = function (xmlObj) {
  var result = {};
  if (xmlObj.RenderedData === undefined) {
    return result;
  } else {
    xmlObj = xmlObj.RenderedData;
  }

  // Audio Info
  if (xmlObj.AudioInfo !== undefined) {
    result.audioInfo = changePropsInitialCase(xmlObj.AudioInfo, 'lowerFirst');
  }

  var what = Object.prototype.toString;
  if (xmlObj.Specs !== undefined) {
    result.nameValuePairs = [];
    if (what.call(xmlObj.Specs.SpCx.CSp) !== '[object Array]'){
      // Make it into an array for consistency
      xmlObj.Specs.SpCx.CSp = [clone(xmlObj.Specs.SpCx.CSp)]
    }
    for (var i = 0; i < xmlObj.Specs.SpCx.CSp.length; i++) {
      var currentFieldsArray = xmlObj.Specs.SpCx.CSp[i].SpCx.Sp;
      var name = '';
      var value = '';
      for ( var j = 0; currentFieldsArray.length > j; j++ ) {
        name = currentFieldsArray[j].$name;
        value = currentFieldsArray[j].$val;
        result.nameValuePairs.push({name: name, value: value});
      }
    }
  }

  return result;
};

var getReactStartingData = function () {
  var obj = getLoadedXmlAsObject();
  var topLvlName = getTopLevelXmlName();
  var result = convertSpecsToReactData(obj[topLvlName]);

  var givenResolutions = obj[topLvlName].ResolutionOptions.ListItemViewModel;
  if (givenResolutions == false) {throw new Error('No resolutions available')}
  if (givenResolutions.length === undefined) {
    // jxon will only create an array if there is more than one value.
    // We want an array every time.
    givenResolutions = [givenResolutions];
  }
  // Eventual refactor for arrays of Objects?
  var resolutions = []
  for (var i=0; i < givenResolutions.length; i++) {
    resolutions.push(changePropsInitialCase(givenResolutions[i],'lowerFirst'));
  }
  result.resolutions = resolutions;
  result.resolutionId = resolutions[0].id;

  // The easy one:
  result.isPreview = obj[topLvlName].IsPreview;

  return result;
};

function objectToXml (object) {
  return '<?xml version="1.0" encoding="utf-16"?>\n' + jxon.jsToString(object);
}

var updateXmlForOrder = function (reactObj) {
  var promise = Deferred();
  var orderObject = clone(startingPoint);
  var topLvlName = getTopLevelXmlName();
  var finalOrderXml = '';

  // Pick a resolution
  if (reactObj.resolutionId === undefined || reactObj.ResolutionId === 0) {
    promise.reject('No ResolutionId was present');
  }
  orderObject[topLvlName].ResolutionId = reactObj.resolutionId;

  // copy audio
  if (reactObj.audioInfo === undefined) {
    promise.reject('No audioInfo was present');
  }

  orderObject[topLvlName].RenderedData.AudioInfo = changePropsInitialCase(reactObj.audioInfo, 'UpperFirst');

  // Distribute Specs
  if (reactObj.ui === undefined) {
    promise.reject('No Specs were sent');
    return promise;
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

        orderObject[topLvlName].RenderedData.Specs.SpCx.CSp.push({
          $name: key,
          $val: 'CD|' + key + '|',
          SpCx: {
            Sp: SpArray
          }
        });

      }
    }

  }

  //Preview?
  orderObject[topLvlName].IsPreview = reactObj.isPreview;

  finalOrderXml = objectToXml(orderObject);
  setXmlContainerValue(finalOrderXml);
  promise.resolve();

  return promise;
};

export default {
  getReactStartingData,
  updateXmlForOrder
};
