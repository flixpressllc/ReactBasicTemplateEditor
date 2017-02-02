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

  populateContainersWithPreviewData: function (containersObj, nameValuePairsObj) {
    let newContainersObj = clone(containersObj);
    dc.getContainerNames().map((containerName) => {
      // do the new stuff
      let dataTypeName = dc.getDataTypeNameFor(containerName);
      let container = newContainersObj[containerName];
      if (!isEmpty(container)) {
        newContainersObj[containerName] = this.mergeAllNodesInContainerWithPreviewData(container, dataTypeName, nameValuePairsObj);
      }
    });
    return newContainersObj;
  },

  extractAndReplacePreviewRenderValues: function (stateToMerge, nameValuePairsObj) {
    stateToMerge = clone(stateToMerge);

    if (isNotEmpty(nameValuePairsObj)) {
      let populatedContainers = this.populateContainersWithPreviewData(
        this.getCurrentContainerState(), nameValuePairsObj);
      stateToMerge = Object.assign({}, stateToMerge, populatedContainers);
    }
    stateToMerge = this.imagesAreSnowflakes(stateToMerge, nameValuePairsObj);

    return stateToMerge;
  },

  imagesAreSnowflakes: function (stateToMerge, nameValuePairsObj) {
    if (this.props.templateType !== 'images') return stateToMerge;
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
      if (isNotEmpty(imageChooser.containedImages)) {
        imageChooser.containedImages = imageChooser.containedImages.map((val, i) => {
          return Object.assign(val, {id: i});
        })
      }
      if (isNotEmpty(imageChooser.maxImages) && imageChooser.containedImages.length > imageChooser.maxImages) {
        imageChooser.containedImages = imageChooser.containedImages.slice(0, imageChooser.maxImages);
      }
      return [key, imageChooser];
    });
    newStateToMerge.userImageChoosers = singlePopulatedChooser;
    return newStateToMerge;
  },

  getStartingData: function () { return new Promise((resolve) => {
    let [stateToMerge, nameValPairsObj] = renderDataAdapter.getReactStartingData();
    stateToMerge = this.extractAndReplacePreviewRenderValues(stateToMerge, nameValPairsObj);
    this.setState(stateToMerge, resolve);
  })},

  // Returns true if it passes, or an array of strings describing
  // why it didn't pass.
  checkResult: function (results) {
    var messages = [];
    var userSettingsData = this.props.userSettingsData;
    // Template Id's match?
    if (results.templateId.toString() !== userSettingsData.templateId.toString()) {
      messages.push(`Template IDs do not match. This page reports: ${userSettingsData.templateId}, JSON file reports: ${results.templateId}`);
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
        this.setState(result.data, resolve);
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
      .then(() => this.getStartingData())
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

  componentDidMount: function () {
    this.setupEditor();
  },

  componentWillUnmount: function () {
    this.serverRequest.abort();
  },

  handleFieldsChange: function (fieldName, userText) {
    var fields = this.state.textFields;
    fields[fieldName].value = userText;
    this.setState({textFields: fields});
  },

  handleYouTubeLinksChange: function (fieldName, userText) {
    var fields = this.state.youTubeLinks;
    fields[fieldName].value = userText;
    this.setState({youTubeLinks: fields});
  },

  handleTextBoxesChange: function (fieldName, userText) {
    var textBoxes = this.state.textBoxes;
    textBoxes[fieldName].value = userText;
    this.setState({textBoxes: textBoxes});
  },

  handleDropDownChange: function (selectElement, ddName) {
    var ddState = this.state.dropDowns;
    ddState[ddName].value = selectElement.value;
    this.setState({dropDowns: ddState});
  },

  handleColorPickerChange: function (fieldName, userColor) {
    var pickerState = this.state.colorPickers;
    pickerState[fieldName].value = userColor;
    this.setState({colorPickers: pickerState});
  },

  handleValidVideoFound: function (fieldName, videoId, title) {
    var youTubeLinksState = this.state.youTubeLinks;
    youTubeLinksState[fieldName].videoId = videoId;
    youTubeLinksState[fieldName].title = title;
    this.setState({youTubeLinks: youTubeLinksState});
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
    let imageChoosers = traverseObject(this.state.userImageChoosers, (key, imageChooser) => {
      imageChooser.containedImages = newArrayOfImages;
      return [key, imageChooser];
    });
    this.setState({userImageChoosers: imageChoosers});
  },

  populateOrderUi: function () {
    let orderUi = clone(this.state.ui);
    // add values to order.ui
    orderUi = orderUi.map(sectionObjContainerObj =>{
      sectionObjContainerObj = traverseObject(sectionObjContainerObj, (sectionName, formDataObjectArray) => {
        formDataObjectArray = formDataObjectArray.map(formDataObj => {
          let formIdName = formDataObj.name;
          let type = firstCharToLower(formDataObj.type);   // 'TextField' to 'textField'
          let containerName = dc.getContainerNameFor(type);

          formDataObj.value = dc.getToRenderStringFunctionFor(type)(this.state[containerName][formIdName]);
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
          onFieldsChange={this.handleFieldsChange}
          onYouTubeLinksChange={this.handleYouTubeLinksChange}
          onValidVideoFound={this.handleValidVideoFound}
          onTextBoxesChange={this.handleTextBoxesChange}
          onDropDownChange={this.handleDropDownChange}
          onColorPickerChange={this.handleColorPickerChange}
          allUserImageChoosers={ this.state.userImageChoosers }
          onUpdateImages={ this.handleUpdateImages }
          imageBank={ this.state.imageBank }
        />
      );
    }

    return (
      <div className="reactBasicTemplateEditor-EditorUserInterface">
        <h1 className="reactBasicTemplateEditor-EditorUserInterface-title">
          <span>Editing Template {this.props.userSettingsData.templateId}</span>
        </h1>
        <Messages messages={this.state.caughtErrors} typeOverride="bad"/>
        <div className="reactBasicTemplateEditor-EditorUserInterface-formArea">
            <div className="reactBasicTemplateEditor-EditorUserInterface-column">
            {editingUi}
            <SoundPicker
              audioInfo={this.state.audioInfo}
              username={this.props.userSettingsData.username}
              onChooseSong={this.handleChooseSong}
            />
          </div>
          <div className="reactBasicTemplateEditor-EditorUserInterface-column">
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
