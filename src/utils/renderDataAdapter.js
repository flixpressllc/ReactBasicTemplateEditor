import {xmlStringToObject, objectToXml} from './xmlAdapter';
import { XML_CONTAINER_ID, IMAGES_CONTAINER_ID,
  TOP_LEVEL_NAME_IMAGES, TOP_LEVEL_NAME_TEXT_ONLY} from '../stores/app-settings';
import { getElementById } from './dom-queries';
import { clone, convertPropKeysForJs, convertPropKeysForAsp,
  nestedPropertyTest, isObject, isNotEmpty, isEmpty,
  traverseObject, wrapObjectWithProperty, forceArray, nestedPropertyExists } from 'happy-helpers';

let startingPoint = {
  ResolutionId: 0,
  IsPreview: false
};

let startingSpecs = {
  Specs: {
    $name: 'Specs',
    $val: '',
    SpCx: {
      CSp: []
    }
  }
};

let startingSlides = {
  Slides: {
    FSlide: {
      Captions: {},
      Images: {}
    }
  }
};

let startingAudioInfo = {
  AudioInfo: {
    Name: null,
    Length: '0',
    AudioType: 'NoAudio',
    Id: '0',
    AudioUrl: null
  }
};

function getEmptyRenderedData () {
  if (isImageTemplate()) {
    return Object.assign({}, startingSlides, startingAudioInfo)
  } else {
    return Object.assign({}, startingSpecs, startingAudioInfo)
  }
}

function getEmptyStartingPoint () {
  let orderStartingPoint = clone(startingPoint);
  orderStartingPoint.RenderedData = getEmptyRenderedData();
  return orderStartingPoint;
}

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
  return xmlStringToObject(getLoadedXmlAsString());
};

function isImageTemplate () {
  return getTopLevelXmlName() === TOP_LEVEL_NAME_IMAGES;
}

var getTopLevelXmlName = function () {
  const allowedNames = [TOP_LEVEL_NAME_TEXT_ONLY, TOP_LEVEL_NAME_IMAGES]
  let topLevelName = '';
  traverseObject(getLoadedXmlAsObject(), key => {
    if ( allowedNames.indexOf(key) !== -1 )
    topLevelName = key;
  });
  if (topLevelName === '') throw new Error('no TopLevelName discovered in ' + getLoadedXmlAsString());
  return topLevelName;
};


var convertSpecsToReactData = function (givenXmlObj) {
  if (!nestedPropertyExists(givenXmlObj,'RenderedData.Specs.SpCx.CSp')) {
    return [];
  }
  let specs = forceArray(clone(givenXmlObj.RenderedData.Specs.SpCx.CSp));

  let nameValuePairs = [];
  for (var i = 0; i < specs.length; i++) {
    var currentFieldsArray = forceArray(specs[i].SpCx.Sp);
    var name = '';
    var value = '';
    for ( var j = 0; currentFieldsArray.length > j; j++ ) {
      name = currentFieldsArray[j].$name;
      value = currentFieldsArray[j].$val;
      let o = {};
      o[name] = value;
      nameValuePairs.push(o);
    }
  }

  return nameValuePairs;
};

function getStartingResolutionsObject (obj) {
  if (!nestedPropertyTest(obj, 'ResolutionOptions.ListItemViewModel', isNotEmpty)) {
    throw new Error('No resolutions available');
  }

  let givenResolutions = forceArray(clone(obj.ResolutionOptions.ListItemViewModel));

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

function getImagesFromHiddenField () {
  let container = getElementById(IMAGES_CONTAINER_ID);
  if (!container) return [];

  let imagesString = getElementById(IMAGES_CONTAINER_ID).value;
  let imagesArray = imagesString.split('|');
  return imagesArray.filter( val => isNotEmpty(val) );
}

function getImagesFromUnusedRenderData (obj) {
  if (nestedPropertyTest(obj, 'RenderedData.UnusedImageUrls.String', isNotEmpty)) {
    return forceArray(obj.RenderedData.UnusedImageUrls.String);
  } else {
    return [];
  }
}

function getImageBankObject (obj) {
  if (!isImageTemplate()) return {};
  let allImages = getImagesFromUnusedRenderData(obj)
    .concat(getImagesFromHiddenField())
    .reduce((a, file) => {
      if (a.indexOf(file) === -1) a.push(file);
      return a;
    }, []);

  return { imageBank: allImages };
}

function getNameValuePairsForMainCaptionFields (givenXmlObj) {
  let nameValuePairs = [];
  if (nestedPropertyTest(givenXmlObj,'RenderedData.Captions.CaptionField', isNotEmpty)) {
    let rDataCaptionFields = forceArray(givenXmlObj.RenderedData.Captions.CaptionField);

    rDataCaptionFields.map((captionField) => {
      let o = {};
      o[captionField.Label] = captionField.Value;
      nameValuePairs.push(o);
    });
  }

  return nameValuePairs;
}

function returnNameValuePairForSingleImageContainer (givenXmlObj) {
  if (nestedPropertyTest(givenXmlObj,'RenderedData.Slides.FSlide.Images.CaptionedImage', isNotEmpty)) {
    let captionedImages = forceArray(givenXmlObj.RenderedData.Slides.FSlide.Images.CaptionedImage);
    let mainImageData = [];
    captionedImages.map( (capImage, i) => {
      let capFields = forceArray(capImage.Captions.CaptionField);
      if (isEmpty(capFields)) {
        mainImageData.push({id: i, file: capImage.Filename});
      } else {
        mainImageData.push({id: i, file: capImage.Filename, captions: capFields.map(field => {
            return field.Value;
          })
        });
      }
    });
    return {ImageContainer: mainImageData};
  }
  return {};
}

function convertCaptionsToReactData (givenXmlObj) {
  let nameValuePairs = getNameValuePairsForMainCaptionFields(givenXmlObj);
  let imageContainerPair = returnNameValuePairForSingleImageContainer(givenXmlObj);

  if (isNotEmpty(imageContainerPair)) nameValuePairs.push(imageContainerPair);

  if (isEmpty(nameValuePairs)) {
    return [];
  } else {
    return nameValuePairs;
  }
}

function getNameValuePairsObj(givenXmlObj) {
  let nameValuePairsArr = isImageTemplate() ? convertCaptionsToReactData(givenXmlObj) : convertSpecsToReactData(givenXmlObj);

  return Object.assign({}, ...nameValuePairsArr);
}

function getReactStartingData () {
  let xmlObj = getLoadedXmlAsObject()[getTopLevelXmlName()];

  return [
    Object.assign(
      getImageBankObject(xmlObj),
      getStartingResolutionsObject(xmlObj),
      getStartingAudioObject(xmlObj),
      {isPreview: false},
    ),
    getNameValuePairsObj(xmlObj)
  ];

}

function orderObjectToXml (object) {
  const FIND_ORDER_REQ_TAG = /<(OrderReq[A-z]+)[^>]*>/;
  const firstString = '<?xml version="1.0" encoding="utf-16"?>\n'
  const typeDeclaration = 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"';

  let xmlString = objectToXml(object);
  xmlString = xmlString.replace(FIND_ORDER_REQ_TAG, (match, capture) => {
    debugger;
    return `<${capture} ${typeDeclaration}>`;
  })
  return firstString + xmlString;
}

function addResolutionToOrderObj (orderObj, reactObj) {
  if (reactObj.resolutionId === undefined || reactObj.resolutionId === 0) {
    throw new Error('No ResolutionId was present');
  }
  if (reactObj.resolutionOptions === undefined) {
    throw new Error('Resolution Options are extraneous... but I want the data to match exactly. No Resolution Options were present.')
  }
  let newOrderObj = clone(orderObj);
  newOrderObj.ResolutionId = reactObj.resolutionId;
  return newOrderObj;
}

function addResolutionOptionsToOrderObj (orderObj, reactObj) {
  if (reactObj.resolutionOptions === undefined) {
    throw new Error('Resolution Options are extraneous... but I want the data to match exactly. No Resolution Options were present.')
  }
  let newOrderObj = clone(orderObj);
  newOrderObj.ResolutionOptions = reactObj.resolutionOptions.reduce((a, resObj) => {
    // TODO: test that this is actually necessary... just flipping the order
    if (isImageTemplate()){
      a.ListItemViewModel.push({
        'Id': resObj.id,
        'Name': resObj.name
      });
    } else {
      a.ListItemViewModel.push({
        'Name': resObj.name,
        'Id': resObj.id
      });
    }
    return a;
  }, {'ListItemViewModel':[]});
  return newOrderObj;
}

function sortObjectByArray (keysInOrder, obj) {
  let newObj = keysInOrder.reduce((a, key) => {
    if (!obj.hasOwnProperty(key)) return a;
    a[key] = clone(obj[key]);
    return a;
  }, {});

  traverseObject(obj, (key, value) => {
    if (newObj.hasOwnProperty(key)) return;
    newObj[key] = clone(value);
  });

  return newObj;
}

function addAudioToOrderObj (orderObj, reactObj) {
  if (reactObj.audioInfo === undefined) {
    throw new Error('No audioInfo was present');
  }
  let newOrderObj = clone(orderObj);

  let sortOrder = ['length', 'id', 'audioType', 'name', 'audioUrl']

  // TODO: test if this flip reordering is actually necessary
  if (isImageTemplate()) {
    sortOrder = ['audioUrl', 'name', 'audioType', 'length', 'id'];
  }

  let audioObject = sortObjectByArray(sortOrder, reactObj.audioInfo);

  // copy audio
  newOrderObj.RenderedData.AudioInfo = convertPropKeysForAsp(audioObject);
  return newOrderObj;
}

function addSpecsToOrderObj (orderObj, reactObj) {
  if (reactObj.ui === undefined) {
    throw new Error('No Specs were sent');
  }

  let newOrderObj = clone(orderObj);
  // Distribute Specs
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

function addImageRenderDataToOrderObject (orderObject, reactObj) {
  if (reactObj.ui === undefined) {
    throw new Error('No Image Data was sent');
  }

  let newOrderObj = clone(orderObject);
  var Captions = {CaptionField: []};
  let Images = {CaptionedImage: []};

  for (var i = 0; i < reactObj.ui.length; i++) {

    for (var key in reactObj.ui[i]) {
      if (reactObj.ui[i].hasOwnProperty(key)){

        for (var j = 0; j < reactObj.ui[i][key].length; j++) {
          if (reactObj.ui[i][key][j].type !== 'UserImageChooser') {
            Captions.CaptionField.push({
              Label: reactObj.ui[i][key][j].name,
              Value: reactObj.ui[i][key][j].value
            });
          } else {
            let chooser = reactObj.ui[i][key][j];
            chooser.value.map(imgObj => {
              Images.CaptionedImage.push({
                Captions: { CaptionField:
                  imgObj.captions.map((cap) => {
                    return {
                      Label: cap.label,
                      Value: cap.value
                    };
                  })
                },
                Filename: imgObj.file
              });
            });
          }
        }
      }
    }
  }

  newOrderObj.RenderedData.Slides.FSlide.Images = Images;

  let unusedImages = {UnusedImageUrls: { String: reactObj.imageBank}};

  let otherProps = [
    {LogoMode: 'Image'},
    {LogoId: 0},
    {LogoFilename: {}},
    {Logo3DFilename: {}}
  ]

  Object.assign(newOrderObj.RenderedData, {Captions}, unusedImages, ...otherProps);

  let sortArray = ['Slides', 'UnusedImageUrls', 'Captions', 'LogoMode', 'AudioInfo', 'LogoId', 'LogoFilename', 'Logo3DFilename'];

  newOrderObj.RenderedData = sortObjectByArray(sortArray, newOrderObj.RenderedData);

  return newOrderObj
}

function updateXmlForOrder (reactObj) {
  var orderObject = getEmptyStartingPoint();

  orderObject = addResolutionToOrderObj(orderObject, reactObj);
  orderObject = addAudioToOrderObj(orderObject, reactObj);
  orderObject.IsPreview = reactObj.isPreview;
  orderObject = addResolutionOptionsToOrderObj(orderObject, reactObj);

  if (isImageTemplate()) {
    orderObject = addImageRenderDataToOrderObject(orderObject, reactObj);
  } else {
    orderObject = addSpecsToOrderObj(orderObject, reactObj);
  }

  let sortArray = ['ResolutionId', 'IsPreview', 'ResolutionOptions', 'RenderedData'];

  if (isImageTemplate()) {
    sortArray = ['IsPreview', 'RenderedData', 'ResolutionId', 'ResolutionOptions'];
  }

  orderObject = sortObjectByArray(sortArray, orderObject);

  orderObject = wrapObjectWithProperty(orderObject, getTopLevelXmlName());
  setXmlContainerValue( orderObjectToXml(orderObject) );
}

export {
  getReactStartingData,
  updateXmlForOrder
};

export let _private = {
  getImagesFromUnusedRenderData
};
