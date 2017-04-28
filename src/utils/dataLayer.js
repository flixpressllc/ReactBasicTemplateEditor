import RenderDataStore from '../stores/RenderDataStore';
import StateStore from '../stores/StateStore';
import * as UiActions from '../actions/uiActions';
import * as TemplateOptionsActions from '../actions/TemplateOptionsActions';
import * as TemplateSpecActions from '../actions/TemplateSpecActions';
import * as ContainerActions from '../actions/ContainerActions';
import * as StateActions from '../actions/StateActions';
import * as renderDataAdapter from '../utils/renderDataAdapter';
import * as dc from '../utils/globalContainerConcerns';
import { traverseObject, firstCharToLower, clone, isEmpty, isNotEmpty } from 'happy-helpers';
import { getJSON } from '../utils/ajax';

class DataLayer {
  respectMinimumImageValue (imageChooser, imageBank) {
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

  mergeAllNodesInContainerWithPreviewData (container, dataTypeName, nameValuePairsObj) {
    if (isEmpty(container)) {
      throw new Error(`The passed in container was empty for passed in datatype of ${dataTypeName}`);
    }
    return traverseObject(container, (formIdName, obj) => {
      return [formIdName, dc.getToDataObjectFunctionFor(dataTypeName)(nameValuePairsObj[formIdName], obj)];
    })
  }

  populateContainersWithPreviewData (containersObj, nameValuePairsObj) {
    dc.getContainerNames().map((containerName) => {
      // do the new stuff
      let dataTypeName = dc.getDataTypeNameFor(containerName);
      let container = containersObj[containerName];
      if (!isEmpty(container)) {
        containersObj[containerName] = this.mergeAllNodesInContainerWithPreviewData(container, dataTypeName, nameValuePairsObj);
      }
    });
    return containersObj;
  }

  assignIds (containedImages) {
    if (isEmpty(containedImages)) return containedImages;
    return containedImages.map((val, i) => {
      return Object.assign(val, {id: i});
    });
  }

  createBlankCaptionsIfNeeded (imageChooser) {
    if (isNotEmpty(imageChooser.captions)) {
      imageChooser.containedImages = imageChooser.containedImages.map(imageObj => {
        if (isEmpty(imageObj.captions)) {
          imageObj.captions = imageChooser.captions.map( () => '' );
        }
        return imageObj;
      });
    }
    return imageChooser;
  }

  respectMaximumImageValue (imageChooser) {
    if (isEmpty(imageChooser.maxImages)) return imageChooser;
    imageChooser = clone(imageChooser);

    // drain extra images
    if (imageChooser.containedImages.length > imageChooser.maxImages) {
      imageChooser.containedImages = imageChooser.containedImages.slice(0, imageChooser.maxImages);
    }

    return imageChooser;
  }

  isImageTemplate () {
    return StateStore.getState('templateType') === 'images';
  }

  imagesAreSnowflakes (stateToMerge, nameValuePairsObj, imageBank) {
    if (!this.isImageTemplate()) return stateToMerge;
    let newStateToMerge = clone(stateToMerge);

    let singlePopulatedChooser = traverseObject(newStateToMerge.userImageChoosers, (key, imageChooser) => {
      if (isNotEmpty(nameValuePairsObj['ImageContainer'])) {
        // imageChooser.containedImages = nameValuePairsObj[key];
        // This is a workaround for now. We always will have only one image container
        // This is in place of an actual name for the field
        imageChooser.containedImages = nameValuePairsObj['ImageContainer'];
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

      imageChooser = this.respectMaximumImageValue(imageChooser);
      imageChooser = this.respectMinimumImageValue(imageChooser, imageBank);
      imageChooser.containedImages = this.assignIds(imageChooser.containedImages);
      imageChooser = this.createBlankCaptionsIfNeeded(imageChooser);

      return [key, imageChooser];
    });
    newStateToMerge.userImageChoosers = singlePopulatedChooser;
    return newStateToMerge;
  }

  extractAndReplacePreviewRenderValues (emptyUiContainers, nameValuePairsObj, imageBank) {
    let stateToMerge = clone(emptyUiContainers);
    if (isNotEmpty(nameValuePairsObj)) {
      let populatedContainers = this.populateContainersWithPreviewData(emptyUiContainers, nameValuePairsObj);
      stateToMerge = Object.assign({}, emptyUiContainers, populatedContainers);
    }
    stateToMerge = this.imagesAreSnowflakes(stateToMerge, nameValuePairsObj, imageBank);
    return stateToMerge;
  }

  _setAllData (containers, highLevelData, uiDefinition) {
    ContainerActions.setInitialContainerValues(containers);

    TemplateOptionsActions.setTemplateOptions({resolutionOptions:highLevelData.resolutions});

    TemplateOptionsActions.setTemplateOptions({resolutionId:highLevelData.resolutionId});
    TemplateOptionsActions.setTemplateOptions({isPreview:highLevelData.isPreview});
    TemplateOptionsActions.setTemplateOptions({imageBank:highLevelData.imageBank});
    TemplateOptionsActions.setTemplateOptions({audioInfo:highLevelData.audioInfo});

    UiActions.setUiDefinition(uiDefinition);

  }

  setupEditor (jsonUrl) {return new Promise((resolve) => {
    let getSettingsData = this.getSettingsData(jsonUrl);
    getSettingsData
      .then(emptyUiData => this.infuseStartingData(emptyUiData))
      .then(resolve);

    getSettingsData.catch((possibleReason)=>{
      let errors = StateStore.getState('caughtErrors') || [];
      errors.push({message: 'Could not load template data.'});
      if (possibleReason) { errors.push({message: possibleReason}); }
      StateActions.setState({
        caughtErrors: errors
      });
    });
  })}

  infuseStartingData (emptyUiData) { return new Promise((resolve) => {
    let containerNames = dc.getContainerNames();
    let emptyContainers = traverseObject(emptyUiData, (key, val) => {
      if (containerNames.indexOf(key) !== -1) {
        return [key, val];
      }
    })
    let [highLevelData, specsNameValuePairs] = renderDataAdapter.getReactStartingData();
    let stateToMerge = this.extractAndReplacePreviewRenderValues(emptyContainers, specsNameValuePairs, highLevelData.imageBank);

    let containers = traverseObject(Object.assign(emptyUiData, stateToMerge), (key, val) => {
      if (dc.getContainerNames().indexOf(key) !== -1) return [key, val];
    });

    this._setAllData(containers, highLevelData, emptyUiData.ui)
    resolve();
  })}

  // Returns true if it passes, or an array of strings describing
  // why it didn't pass.
  checkResult (results) {
    let messages = [];
    let templateId = StateStore.getState('templateId');
    // Template Id's match?
    if (results.templateId.toString() !== templateId.toString()) {
      messages.push(`Template IDs do not match. This page reports: ${templateId}, JSON file reports: ${results.templateId}`);
    }

    if (messages.length === 0){
      return true;
    } else {
      return messages;
    }
  }

  getSettingsData (uiSettingsJsonUrl) { return new Promise( (resolve, reject) => {
    getJSON(uiSettingsJsonUrl)
    .then( json => {
      var checkedResults = this.checkResult(json);
      if (checkedResults === true) {
        resolve(json);
      } else {
        // Post Errors
        var errors = [];
        for (var i = 0; i < checkedResults.length; i++) {
          errors.push({ message: checkedResults[i] })
        }
        StateActions.setState({ caughtErrors: errors });
      }
    }, err => reject(err));
  })}

  populateOrderUi (givenUi) {
    let orderUi = clone(givenUi);
    let containers = RenderDataStore.getAllContainers();
    // add values to order.ui
    orderUi = orderUi.map(sectionObjContainerObj =>{
      sectionObjContainerObj = traverseObject(sectionObjContainerObj, (sectionName, formDataObjectArray) => {
        formDataObjectArray = formDataObjectArray.map(formDataObj => {
          let formIdName = formDataObj.name;
          let type = firstCharToLower(formDataObj.type);   // 'TextField' to 'textField'
          let containerName = dc.getContainerNameFor(type);

          formDataObj.value = dc.getToRenderStringFunctionFor(type)(containers[containerName][formIdName]);
          return formDataObj;
        });
        return [sectionName, formDataObjectArray];
      });
      return sectionObjContainerObj;
    });
    return orderUi;
  }

  prepOrderForSubmit() {
    let orderSettings = Object.assign({}, RenderDataStore.getTemplateOptions(), {ui: RenderDataStore.getUiDefinition()} );

    let success = false;
    let order = clone(orderSettings);
    order.ui = this.populateOrderUi(order.ui);
    order.imageBank = order.imageBank || [];
    try {
      renderDataAdapter.updateXmlForOrder(order);
      success = true;
    } catch (failureReason) {
      success = false;
      var message = 'Order Failed.';
      if (failureReason !== undefined){
        message += ` The given reason was "${failureReason}"`;
      }
      StateStore.setState({ caughtErrors: [ {message: message} ] });

      // This method of calling console (essentially) tells the build
      // script that this is an intentional call, meant for production
      var c = console;
      c.log('Sent Object:',order);
      c.error('Order Failure: ' + failureReason);
    }

    return success;

  }
}

export default new DataLayer();
