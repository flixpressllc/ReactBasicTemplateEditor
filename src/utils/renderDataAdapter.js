import jxon from './xmlAdapter';
import { XML_CONTAINER_ID, IMAGES_CONTAINER_ID,
  TOP_LEVEL_NAME_IMAGES, TOP_LEVEL_NAME_TEXT_ONLY} from '../stores/app-settings';
import { getElementById } from './dom-queries';
import { clone, convertPropKeysForJs, convertPropKeysForAsp,
  nestedPropertyTest, isObject, isNotEmpty, isEmpty,
  traverseObject, wrapObjectWithProperty } from './helper-functions';

// The next comment line will tell JSHint to ignore double quotes for a bit
/* eslint-disable quotes */
let startingPoint = {
  '$xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
  '$xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
  ResolutionId: 0,
  IsPreview: false
};
/* eslint-enable quotes */

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

function getStartingRenderedData () {
  if (isImageTemplate()) {
    return Object.assign({}, startingSlides, startingAudioInfo)
  } else {
    return Object.assign({}, startingSpecs, startingAudioInfo)
  }
}

function getOrderStartingPoint () {
  let orderStartingPoint = clone(startingPoint);
  orderStartingPoint.RenderedData = getStartingRenderedData();
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
  return jxon.stringToJs(getLoadedXmlAsString());
};

function isImageTemplate () {
  return getTopLevelXmlName() === 'OrderRequestOfFSlidesRndTemplate';
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

function getImagesFromHiddenField () {
  let container = getElementById(IMAGES_CONTAINER_ID);
  if (!container) return [];

  let imagesString = getElementById(IMAGES_CONTAINER_ID).value;
  let imagesArray = imagesString.split('|');
  return imagesArray.filter( val => isNotEmpty(val) );
}

function getImagesFromUnusedRenderData (obj) {
  if (nestedPropertyTest(obj, 'RenderedData.UnusedImageUrls.String', isNotEmpty)) {
    return obj.RenderedData.UnusedImageUrls.String;
  } else {
    return [];
  }
}

function getImageBank (obj) {
  let allImages = getImagesFromUnusedRenderData(obj)
    .concat(getImagesFromHiddenField())
    .reduce((a, file, i) => {
      a.push({ id: i, file: file });
      return a;
    }, []);

  return { imageBank: allImages };
}

function getNameValuePairsForMainCaptionFields (givenXmlObj) {
  let nameValuePairs = [];
  if (nestedPropertyTest(givenXmlObj,'RenderedData.Captions.CaptionField', isNotEmpty)) {
    let rDataCaptionFields = givenXmlObj.RenderedData.Captions.CaptionField;
    if (! Array.isArray(rDataCaptionFields)) {
      rDataCaptionFields = [rDataCaptionFields];
    }

    rDataCaptionFields.map((captionField) => {
      nameValuePairs.push({name: captionField.Label, value:captionField.Value});
    });
  }

  return nameValuePairs;
}

function returnNameValuePairForSingleImageContainer (givenXmlObj) {
  if (nestedPropertyTest(givenXmlObj,'RenderedData.Slides.FSlide.Images.CaptionedImage', isNotEmpty)) {
    let captionedImages = givenXmlObj.RenderedData.Slides.FSlide.Images.CaptionedImage;
    if (! Array.isArray(captionedImages)) captionedImages = [captionedImages];
    let mainImageData = [];
    captionedImages.map( (capImage, i) => {
      mainImageData.push({id: i, file: capImage.Filename, caption: capImage.Captions.CaptionField.Value});
    });
    return {name: 'ImageContainer', value: mainImageData};
  }
  return {};
}

function convertCaptionsToReactData (givenXmlObj) {
  let nameValuePairs = getNameValuePairsForMainCaptionFields(givenXmlObj);
  let imageContainerPair = returnNameValuePairForSingleImageContainer(givenXmlObj);

  if (isNotEmpty(imageContainerPair)) nameValuePairs.push(imageContainerPair);

  if (isEmpty(nameValuePairs)) {
    return {};
  } else {
    return { nameValuePairs };
  }
}

function getReactStartingData () {
  let obj = getLoadedXmlAsObject()[getTopLevelXmlName()];

  let mainData;
  if (isImageTemplate()){
    mainData = convertCaptionsToReactData(obj);
  } else {
    mainData = convertSpecsToReactData(obj);
  }
  let resolutionsObj = getStartingResolutionsObject(obj);
  let audioDataObj = getStartingAudioObject(obj);
  let isPreviewObj = {isPreview: obj.IsPreview};
  let imageBank = isImageTemplate() ? getImageBank(obj) : {} ;

  return Object.assign({}, mainData, resolutionsObj, audioDataObj, isPreviewObj, imageBank);
}

function objectToXml (object) {
  return '<?xml version="1.0" encoding="utf-16"?>\n' + jxon.jsToString(object);
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
                Captions: { CaptionField: {
                  Label: 'Caption',
                  Value: imgObj.caption
                }},
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
  var orderObject = getOrderStartingPoint();

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
  setXmlContainerValue( objectToXml(orderObject) );
}

export {
  getReactStartingData,
  updateXmlForOrder
};
