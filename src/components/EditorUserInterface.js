import React from 'react';
import { getJSON } from '../utils/ajax';
import { find } from '../utils/dom-queries';
import { traverseObject, firstCharToLower, clone, isEmpty, isNotEmpty } from '../utils/helper-functions';
import * as renderDataAdapter from '../utils/renderDataAdapter';
import * as dc from '../utils/globalContainerConcerns';

import Messages from './UserMessages';
import SubmitRender from './SubmitRender';
import ResolutionPicker from './ResolutionPicker';
import EditingUi from './EditingUi';
import SoundPicker from './SoundPicker';
import Modal from 'react-modal';

// This must be called after all the actual containers are called so they can
// register themselves before RenderDataStore tries to get them all...
import RenderDataStore from '../stores/RenderDataStore';
import * as ContainerActions from '../actions/ContainerActions';

import './EditorUserInterface.scss';

var EditorUserInterface = React.createClass({
  getInitialState: function() {
    return {
      allowSubmit: false,
      caughtErrors: []
    };
  },

  handlePlacePreviewOrder: function () {
    this.setState({isPreview: true}, function () {
      this.handlePlaceOrder();
    });
  },

  isImageTemplate: function () {
    return this.props.templateType === 'images';
  },

  mergeAllNodesInContainerWithPreviewData: function (container, dataTypeName, nameValuePairsObj) {
    if (isEmpty(container)) {
      throw new Error(`The passed in container was empty for passed in datatype of ${dataTypeName}`);
    }
    return traverseObject(container, (formIdName, obj) => {
      return [formIdName, dc.getToDataObjectFunctionFor(dataTypeName)(nameValuePairsObj[formIdName], obj)];
    })
  },

  getCurrentContainerState: function () {
    return dc.getContainerNames().reduce((a, containerName) => {
      if(!this.state.hasOwnProperty(containerName)) return a;
      a[containerName] = clone(this.state[containerName]);
      return a;
    }, {});
  },

  populateContainersWithPreviewData: function (nameValuePairsObj) {
    let containersObj = this.getCurrentContainerState();
    dc.getContainerNames().map((containerName) => {
      // do the new stuff
      let dataTypeName = dc.getDataTypeNameFor(containerName);
      let container = containersObj[containerName];
      if (!isEmpty(container)) {
        containersObj[containerName] = this.mergeAllNodesInContainerWithPreviewData(container, dataTypeName, nameValuePairsObj);
      }
    });
    return containersObj;
  },

  extractAndReplacePreviewRenderValues: function (highLevelData, nameValuePairsObj) {
    let stateToMerge = clone(highLevelData);
    if (isNotEmpty(nameValuePairsObj)) {
      let populatedContainers = this.populateContainersWithPreviewData(nameValuePairsObj);
      stateToMerge = Object.assign({}, highLevelData, populatedContainers);
    }
    stateToMerge = this.imagesAreSnowflakes(stateToMerge, nameValuePairsObj);

    return stateToMerge;
  },

  respectMaximumImageValue: function (imageChooser) {
    if (isEmpty(imageChooser.maxImages)) return imageChooser;
    imageChooser = clone(imageChooser);

    // drain extra images
    if (imageChooser.containedImages.length > imageChooser.maxImages) {
      imageChooser.containedImages = imageChooser.containedImages.slice(0, imageChooser.maxImages);
    }

    return imageChooser;
  },

  respectMinimumImageValue: function (imageChooser, imageBank) {
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
  },

  assignIds: function (containedImages) {
    if (isEmpty(containedImages)) return containedImages;
    return containedImages.map((val, i) => {
      return Object.assign(val, {id: i});
    });
  },

  imagesAreSnowflakes: function (stateToMerge, nameValuePairsObj) {
    if (!this.isImageTemplate()) return stateToMerge;
    let newStateToMerge = clone(stateToMerge);

    let singlePopulatedChooser = traverseObject(this.state.userImageChoosers, (key, imageChooser) => {
      if (isNotEmpty(nameValuePairsObj['ImageContainer'])) {
        // imageChooser.containedImages = nameValuePairsObj[key];
        // This is a workaround for now. We always will have only one image container
        // This is in place of an actual name for the field
        imageChooser.containedImages = nameValuePairsObj['ImageContainer'];
      } else {
        // just use all available images...
        imageChooser.containedImages = newStateToMerge.imageBank.map(val => {
          return {file: val};
        });
      }

      imageChooser = this.respectMaximumImageValue(imageChooser);
      imageChooser = this.respectMinimumImageValue(imageChooser, stateToMerge.imageBank);
      imageChooser.containedImages = this.assignIds(imageChooser.containedImages);
      imageChooser = this.createBlankCaptionsIfNeeded(imageChooser);

      return [key, imageChooser];
    });
    newStateToMerge.userImageChoosers = singlePopulatedChooser;
    return newStateToMerge;
  },

  createBlankCaptionsIfNeeded: function (imageChooser) {
    if (isNotEmpty(imageChooser.captions)) {
      imageChooser.containedImages = imageChooser.containedImages.map(imageObj => {
        if (isEmpty(imageObj.captions)) {
          imageObj.captions = imageChooser.captions.map( () => '' );
        }
        return imageObj;
      });
    }
    return imageChooser;
  },

  getStartingData: function (uiData) { return new Promise((resolve) => {
    let [highLevelData, specsNameValuePairs] = renderDataAdapter.getReactStartingData();
    let stateToMerge = this.extractAndReplacePreviewRenderValues(highLevelData, specsNameValuePairs);
    this.setState(stateToMerge, resolve);

    let containers = traverseObject(Object.assign(uiData, stateToMerge), (key, val) => {
      if (dc.getContainerNames().indexOf(key) !== -1) return [key, val];
    });
    ContainerActions.setInitialContainerValues(containers);
  })},

  // Returns true if it passes, or an array of strings describing
  // why it didn't pass.
  checkResult: function (results) {
    let messages = [];
    let templateId = this.props.templateId;
    // Template Id's match?
    if (results.templateId.toString() !== templateId.toString()) {
      messages.push(`Template IDs do not match. This page reports: ${templateId}, JSON file reports: ${results.templateId}`);
    }

    if (messages.length === 0){
      return true;
    } else {
      return messages;
    }
  },

  defineUi: function () { return new Promise( (resolve, reject) => {
    this.serverRequest = getJSON(this.props.uiSettingsJsonUrl)
    .then( result => {
      var checkedResults = this.checkResult(result.data);
      if (checkedResults === true) {
        this.setState(result.data, () => resolve(result.data) );
      } else {
        // Post Errors
        var errors = [];
        for (var i = 0; i < checkedResults.length; i++) {
          errors.push({ message: checkedResults[i] })
        }
        this.setState({ caughtErrors: errors }, reject);
      }
    });
  })},

  setupEditor: function () { return new Promise((resolve) => {
    let defineUi = this.defineUi();
    defineUi
      .then(uiData => this.getStartingData(uiData))
      .then(() => resolve());

    defineUi.catch((possibleReason)=>{
      let errors = this.state.caughtErrors || [];
      errors.push({message: 'Could not load template data.'});
      if (possibleReason) { errors.push({message: possibleReason}); }
      this.setState({
        caughtErrors: errors
      });
    });
  })},

  updateContainerState: function () {
    this.setState(RenderDataStore.getAll())
  },
  
  componentDidMount: function () {
    RenderDataStore.on('change', this.updateContainerState);
    this.setupEditor();
  },

  componentWillUnmount: function () {
    this.serverRequest.abort();
    RenderDataStore.removeEventListener('change', this.updateContainerState);
  },

  handleDropDownChange: function (e, fieldName, callback) {
    ContainerActions.changeContainer('dropDown', fieldName, {value: e.target.value});
    setTimeout(callback, 100); // TODO: fix this hack once this is in the proper component.
  },

  handleResolutionIdChange: function (id) {
    this.setState({
      resolutionId: id
    })
  },

  handlePreviewChange: function (e) {
    this.setState({
      isPreview: e.target.checked
    })
  },

  handleUpdateImages: function (newArrayOfImages) {
    let fieldName;
    traverseObject(this.state.userImageChoosers, (key) => {
      fieldName = key;
    });
    ContainerActions.changeContainer('userImageChooser', fieldName, {containedImages: newArrayOfImages});
  },

  populateOrderUi: function () {
    let orderUi = clone(this.state.ui);
    let containers = RenderDataStore.getAll();
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
  },

  handlePlaceOrder: function () {
    var order = {};

    // add necessaries
    order.ui = this.populateOrderUi();
    order.isPreview = this.state.isPreview;
    order.audioInfo = this.state.audioInfo;
    order.resolutionId = this.state.resolutionId;
    order.resolutionOptions = this.state.resolutions;
    order.imageBank = this.state.imageBank || [];

    try {
      renderDataAdapter.updateXmlForOrder(order);
      this.setState({allowSubmit: true}, function () {
        setTimeout(function(){ find('form input[type="submit"]').eq(0).click(); }, 100);
      });
    } catch (failureReason) {
      var message = 'Order Failed.';
      if (failureReason !== undefined){
        message += ` The given reason was "${failureReason}"`;
      }
      this.setState({
        caughtErrors: [
          {message: message}
        ]
      })
      // This method of calling console (essentially) tells the build
      // script that this is an intentional call, meant for production
      var c = console;
      c.log('Sent Object:',order);
      c.error('Order Failure: ' + failureReason);
    }
  },

  handleChooseSong: function (audioInfo) {
    this.setState({audioInfo: audioInfo})
  },

  render: function() {
    var resolutionPicker = (<span></span>);
    if (this.state.resolutionId !== undefined) {
      resolutionPicker = (
        <ResolutionPicker
          resolutionOptions={this.state.resolutions}
          resolutionIdChange={this.handleResolutionIdChange}
          chosen={this.state.resolutionId}
          disabled={this.state.isPreview}
        />
      );
    }
    var editingUi = (<span></span>);
    if (this.state.ui !== undefined) {
      editingUi = (
        <EditingUi
          templateType={ this.props.templateType}
          uiSections={this.state.ui}
          allTextFields={this.state.textFields}
          allYouTubeLinks={this.state.youTubeLinks}
          allTextBoxes={this.state.textBoxes}
          allDropDowns={this.state.dropDowns}
          allColorPickers={this.state.colorPickers}
          onDropDownChange={this.handleDropDownChange}
          allUserImageChoosers={ this.state.userImageChoosers }
          onUpdateImages={ this.handleUpdateImages }
          imageBank={ this.state.imageBank }
        />
      );
    }

    return (
      <div className="reactBasicTemplateEditor-EditorUserInterface">
        <h1 className="reactBasicTemplateEditor-EditorUserInterface-title">
          <span>Template {this.props.templateId}</span>
        </h1>
        <Messages messages={this.state.caughtErrors} typeOverride="bad"/>
        <div className="reactBasicTemplateEditor-EditorUserInterface-formArea">
            <div className="reactBasicTemplateEditor-EditorUserInterface-column">
            {editingUi}
          </div>
          <div className="reactBasicTemplateEditor-EditorUserInterface-column">
            <SoundPicker
              audioInfo={this.state.audioInfo}
              username={this.props.userSettingsData.username}
              onChooseSong={this.handleChooseSong}
            />
            {resolutionPicker}
            <SubmitRender
              isPreview={this.state.isPreview}
              onChange={this.handlePreviewChange}
              placeOrder={this.handlePlaceOrder}
              allowSubmit={this.state.allowSubmit}
              userSettingsData={this.props.userSettingsData}
              placePreviewOrder={this.handlePlacePreviewOrder}
            />
          </div>
        </div>
        <Modal
          isOpen={this.state.allowSubmit}
          className="reactBasicTemplateEditor-EditorUserInterface-submissionModal"
          overlayClassName="reactBasicTemplateEditor-EditorUserInterface-submissionModalOverlay"
          contentLabel="Submission Modal"
        >
          Your order is being submitted.
        </Modal>
      </div>
    );
  }
});

export default EditorUserInterface;
