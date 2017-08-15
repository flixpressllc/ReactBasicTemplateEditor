import * as TemplateSpecActions from '../actions/TemplateSpecActions';
import RenderDataStore from '../stores/RenderDataStore';
import { traverseObject, clone, isEmpty, isNotEmpty, toType } from 'happy-helpers';

function createCaptionObject(label, overrides = {}) {
  if (toType(label) !== 'string') throw new Error('must pass in string label to createValidCaptionObject');
  let validCaptionObject = {
    settings: {},
    label: label,
    value: ''
  }
  return Object.assign(validCaptionObject, overrides);
}

function respectMinimumImageValue (imageChooser, imageBank) {
  if (isEmpty(imageChooser.minImages)) return imageChooser;
  imageChooser = clone(imageChooser);

  if (imageChooser.containedImages.length < imageChooser.minImages && isNotEmpty(imageBank)) {
    let difference = imageChooser.minImages - imageChooser.containedImages.length;
    for (let i = 0; i < difference; i++) {
      // Just push the first image over and over for now.
      // We aren't trying to magically build the template for them.
      imageChooser.containedImages.push({file: imageBank[0]});
    }
  }

  return imageChooser;
}

function assignIds (containedImages) {
  if (isEmpty(containedImages)) return containedImages;
  return containedImages.map((val, i) => {
    return Object.assign(val, {id: i});
  });
}

function getLabelFromCapDefinition(capDefinition) {
  let label;
  switch (toType(capDefinition)) {
    case 'object':
      label = capDefinition.label;
      break;
    case 'string':
      label = capDefinition;
      break;
    default:
      // eslint-disable-next-line no-console
      console.error('imageChooser.captions', capDefinition);
      throw new Error('imageChooser.captions must be strings or objects only.')
  }
  return label;
}

function getSettingsFromCapDefinition(capDefinition) {
  let settings;
  switch (toType(capDefinition)) {
    case 'object':
      settings = capDefinition.settings;
      break;
    default:
      settings = {};
      break;
  }
  return settings;
}

function getFinalCaptionObject(capDefinition, imageObj) {
  const label = getLabelFromCapDefinition(capDefinition);
  let caption;
  if (imageObj.captionsAndDropDowns) {
    caption = imageObj.captionsAndDropDowns.find(cap => {
      return cap.label === label;
    })
    caption = caption ? caption : createCaptionObject(label);
  } else {
    let value = capDefinition.defaultValue || '';
    caption = createCaptionObject(label, {value})
  }
  caption.settings = getSettingsFromCapDefinition(capDefinition);

  return caption;
}

function mergeCaptionsWithDefinitions (imageChooser) {
  if (isNotEmpty(imageChooser.captions)) {
    imageChooser.containedImages = imageChooser.containedImages.map(imageObj => {
      imageObj.captions = imageChooser.captions.map( capDefinition => {
        return getFinalCaptionObject(capDefinition, imageObj);
      });
      return imageObj;
    });
  }
  return imageChooser;
}

function cleanupImageChooser(imageChooser) {
  imageChooser.containedImages = imageChooser.containedImages.map(imageObj => {
    delete imageObj.captionsAndDropDowns;
    return imageObj;
  })
  return imageChooser;
}

function respectMaximumImageValue (imageChooser) {
  if (isEmpty(imageChooser.maxImages)) return imageChooser;
  imageChooser = clone(imageChooser);

  // drain extra images
  if (imageChooser.containedImages.length > imageChooser.maxImages) {
    imageChooser.containedImages = imageChooser.containedImages.slice(0, imageChooser.maxImages);
  }

  return imageChooser;
}

function imagesAreSnowflakes (valueObject, imageChooser) {
    const imageBank = RenderDataStore.getTemplateOptions('imageBank');
    if (isNotEmpty(valueObject)) {
      // imageChooser.containedImages = nameValuePairsObj[key];
      // This is a workaround for now. We always will have only one image container
      // This is in place of an actual name for the field
      imageChooser.containedImages = valueObject;
    } else {
      // just use all available images...
      imageChooser.containedImages = imageBank.map(val => {
        return {file: val};
      });
    }

    if (imageChooser.maxImages) {
      TemplateSpecActions.setSpecs({maxImages: imageChooser.maxImages});
    }

    if (imageChooser.minImages) {
      TemplateSpecActions.setSpecs({minImages: imageChooser.minImages});
    }

    imageChooser = respectMaximumImageValue(imageChooser);
    imageChooser = respectMinimumImageValue(imageChooser, imageBank);
    imageChooser.containedImages = assignIds(imageChooser.containedImages);
    imageChooser = mergeCaptionsWithDefinitions(imageChooser);
    imageChooser = setupImageDropDowns(imageChooser);
    imageChooser = cleanupImageChooser(imageChooser);

    return imageChooser;
}

function turnHashedObjectIntoArrayOfObjectsWithLabelProperty(object, labelKey = 'label') {
  let resultingArray = [];
  traverseObject(object, (label, props) => {
    if (props.hasOwnProperty(labelKey)) {
      // eslint-disable-next-line no-console
      console.error('object containing a label already:', props);
      throw new Error(`The key ${labelKey} is already in use in the object that was passed in.`)
    }

    let labelObject = {};
    labelObject[labelKey] = label;
    resultingArray.push(Object.assign({}, labelObject, props));
  });
  return resultingArray;
}

function setupImageDropDowns(imageChooser) {
  if (imageChooser.dropDowns === undefined) return imageChooser;
  let newImageChooser = clone(imageChooser);

  newImageChooser.dropDowns = turnHashedObjectIntoArrayOfObjectsWithLabelProperty(newImageChooser.dropDowns);
  const definitions = newImageChooser.dropDowns;

  newImageChooser.containedImages.map(imageObj => {
    imageObj.dropDowns = definitions.map(definition => {
      const label = definition.label;
      let dropDown;
      if (imageObj.captionsAndDropDowns) {
        dropDown = imageObj.captionsAndDropDowns.find(ddOrCap => {
          return ddOrCap.label === label;
        })
        dropDown.options = definition.options;
      } else {
        dropDown = clone(definition);
        dropDown.value = dropDown.default;
        delete dropDown.default;
      }
      return dropDown;
    })
    return imageObj;
  })
  return newImageChooser;
}

export default imagesAreSnowflakes;
