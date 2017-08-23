import RenderDataStore from '../stores/RenderDataStore';
import StateStore from '../stores/StateStore';
import * as UiActions from '../actions/uiActions';
import * as TemplateOptionsActions from '../actions/TemplateOptionsActions';
import * as ContainerActions from '../actions/ContainerActions';
import * as StateActions from '../actions/StateActions';
import * as renderDataAdapter from '../utils/renderDataAdapter';
import * as dc from '../utils/globalContainerConcerns';
import { traverseObject, firstCharToLower, clone, isEmpty, isNotEmpty } from 'happy-helpers';
import { getJSON } from '../utils/ajax';

class DataLayer {
  mergeAllNodesInContainerWithPreviewData (container, dataTypeName, nameValuePairsObj) {
    if (isEmpty(container)) {
      throw new Error(`The passed in container was empty for passed in datatype of ${dataTypeName}`);
    }
    return traverseObject(container, (formIdName, defaultContainer) => {
      const previewDataValue = nameValuePairsObj[formIdName];
      if (previewDataValue === undefined) return [formIdName, defaultContainer]

      const conversionFunction = dc.getToDataObjectFunctionFor(dataTypeName);
      const infusedContainer = conversionFunction(previewDataValue, defaultContainer);
      return [formIdName, infusedContainer];
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

  isImageTemplate () {
    return StateStore.getState('templateType') === 'images';
  }

  extractAndReplacePreviewRenderValues (emptyUiContainers, nameValuePairsObj) {
    let stateToMerge = clone(emptyUiContainers);
    if (isNotEmpty(nameValuePairsObj)) {
      let populatedContainers = this.populateContainersWithPreviewData(emptyUiContainers, nameValuePairsObj);
      stateToMerge = Object.assign({}, emptyUiContainers, populatedContainers);
    }
    return stateToMerge;
  }

  _setHighLevelData(highLevelData) {
    TemplateOptionsActions.setTemplateOptions({resolutionOptions:highLevelData.resolutions});
    TemplateOptionsActions.setTemplateOptions({resolutionId:highLevelData.resolutionId});
    TemplateOptionsActions.setTemplateOptions({isPreview:highLevelData.isPreview});
    TemplateOptionsActions.setTemplateOptions({imageBank:highLevelData.imageBank});
    TemplateOptionsActions.setTemplateOptions({audioInfo:highLevelData.audioInfo});

  }

  _setFilledContainerData (containers) {
    return new Promise(resolve => {
      RenderDataStore.once('INITIAL_CONTAINER_VALUES_SET', resolve);
      ContainerActions.setInitialContainerValues(containers);
    })
  }

  _getCurrentErrors () {
    return StateStore.getState('caughtErrors') || [];
  }

  setupEditor (jsonUrl) {return new Promise((resolve) => {
    let getSettingsData = this.getSettingsData(jsonUrl);
    getSettingsData
      .then(emptyUiData => this.infuseStartingData(emptyUiData))
      .then(resolve);

    getSettingsData.catch((possibleReason)=>{
      let errors = this._getCurrentErrors();
      errors.push({message: 'Could not load template data.'});
      if (possibleReason) { errors.push({message: possibleReason}); }
      StateActions.setState({
        caughtErrors: errors
      });
    });
  })}

  infuseStartingData (emptyUiData) { return new Promise((resolve) => {
    UiActions.setUiDefinition(emptyUiData.ui);

    let containerNames = dc.getContainerNames();
    let emptyContainers = traverseObject(emptyUiData, (key, val) => {
      if (containerNames.indexOf(key) !== -1) {
        return [key, val];
      }
    })

    let [highLevelData, specsNameValuePairs] = renderDataAdapter.getReactStartingData();
    this._setHighLevelData(highLevelData);

    let stateToMerge = this.extractAndReplacePreviewRenderValues(emptyContainers, specsNameValuePairs);

    let containers = traverseObject(Object.assign(emptyUiData, stateToMerge), (key, val) => {
      if (dc.getContainerNames().indexOf(key) !== -1) return [key, val];
    });

    this._setFilledContainerData(containers).then(resolve)
  })}

  _getTemplateId () {
    return StateStore.getState('templateId');
  }

  // Returns true if it passes, or an array of strings describing
  // why it didn't pass.
  checkResult (results) {
    let messages = [];
    let templateId = this._getTemplateId();
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

  _getAllContainers () {
    return RenderDataStore.getAllContainers()
  }

  populateOrderUi (givenUi) {
    let orderUi = clone(givenUi);
    let containers = this._getAllContainers();
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

  _getTemplateOptionsAndUi () {
    return Object.assign({}, RenderDataStore.getTemplateOptions(), {ui: RenderDataStore.getUiDefinition()} );
  }

  _getOrderSettings () {
    let order = clone(this._getTemplateOptionsAndUi());
    order.ui = this.populateOrderUi(order.ui);
    order.imageBank = order.imageBank || [];
    return order;
  }

  prepOrderForSubmit() {
    let success = false;
    const order = this._getOrderSettings();
    try {
      renderDataAdapter.updateXmlForOrder(order);
      success = true;
    } catch (failureReason) {
      success = false;
      var message = 'Order Failed.';
      if (failureReason !== undefined){
        message += ` The given reason was "${failureReason}"`;
      }
      StateActions.setState({ caughtErrors: [ {message: message} ] });

      // This method of calling console (essentially) tells the build
      // script that this is an intentional call, meant for production
      var c = console;
      c.log('Sent Object:', order);
      c.error('Order Failure: ' + failureReason);
    }

    return success;

  }
}

export default new DataLayer();
