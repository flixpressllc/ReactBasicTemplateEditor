import React from 'react';
import { getJSON } from '../utils/ajax';
import { find } from '../utils/dom-queries';
import { traverseObject, firstCharToLower, clone, isEmpty, isNotEmpty } from 'happy-helpers';
import * as renderDataAdapter from '../utils/renderDataAdapter';
import { adjustColorbox } from '../utils/colorbox-manipulation';
import * as dc from '../utils/globalContainerConcerns';

import Messages from './UserMessages';
import SubmitRender from './SubmitRender';
import ResolutionPicker from './ResolutionPicker';
import SpecFields from './SpecFields';
import SoundPicker from './SoundPicker';
import Modal from './lib/Modal';

// This must be called after all the actual containers are called so they can
// register themselves before RenderDataStore tries to get them all...
import RenderDataStore from '../stores/RenderDataStore';
import * as ContainerActions from '../actions/ContainerActions';
import * as TemplateSpecActions from '../actions/TemplateSpecActions';

import './App.scss';

class App extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      allowSubmit: false,
      caughtErrors: []
    };

    this.handlePlaceOrder = this.handlePlaceOrder.bind(this);
    this.handlePlacePreviewOrder = this.handlePlacePreviewOrder.bind(this);
    this.handleChooseSong = this.handleChooseSong.bind(this);
    this.handlePreviewChange = this.handlePreviewChange.bind(this);
    this.handleResolutionIdChange = this.handleResolutionIdChange.bind(this);
  }

  handlePlacePreviewOrder () {
    this.setState({isPreview: true}, function () {
      this.handlePlaceOrder();
    });
  }

  isImageTemplate () {
    return this.props.templateType === 'images';
  }

  mergeAllNodesInContainerWithPreviewData (container, dataTypeName, nameValuePairsObj) {
    if (isEmpty(container)) {
      throw new Error(`The passed in container was empty for passed in datatype of ${dataTypeName}`);
    }
    return traverseObject(container, (formIdName, obj) => {
      return [formIdName, dc.getToDataObjectFunctionFor(dataTypeName)(nameValuePairsObj[formIdName], obj)];
    })
  }

  getCurrentContainerState () {
    return dc.getContainerNames().reduce((a, containerName) => {
      if(!this.state.hasOwnProperty(containerName)) return a;
      a[containerName] = clone(this.state[containerName]);
      return a;
    }, {});
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

  extractAndReplacePreviewRenderValues (emptyUiContainers, nameValuePairsObj, imageBank) {
    let stateToMerge = clone(emptyUiContainers);
    if (isNotEmpty(nameValuePairsObj)) {
      let populatedContainers = this.populateContainersWithPreviewData(emptyUiContainers, nameValuePairsObj);
      stateToMerge = Object.assign({}, emptyUiContainers, populatedContainers);
    }
    stateToMerge = this.imagesAreSnowflakes(stateToMerge, nameValuePairsObj, imageBank);
    return stateToMerge;
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

  assignIds (containedImages) {
    if (isEmpty(containedImages)) return containedImages;
    return containedImages.map((val, i) => {
      return Object.assign(val, {id: i});
    });
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

  getStartingData (uiData) { return new Promise((resolve) => {
    let containerNames = dc.getContainerNames();
    let emptyContainers = traverseObject(uiData, (key, val) => {
      if (containerNames.indexOf(key) !== -1) {
        return [key, val];
      }
    })
    let [highLevelData, specsNameValuePairs] = renderDataAdapter.getReactStartingData();
    let stateToMerge = this.extractAndReplacePreviewRenderValues(emptyContainers, specsNameValuePairs, highLevelData.imageBank);

    let containers = traverseObject(Object.assign(uiData, stateToMerge), (key, val) => {
      if (dc.getContainerNames().indexOf(key) !== -1) return [key, val];
    });
    ContainerActions.setInitialContainerValues(containers);
    this.setState(Object.assign({ui: uiData.ui}, highLevelData), resolve);
  })}

  // Returns true if it passes, or an array of strings describing
  // why it didn't pass.
  checkResult (results) {
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
  }

  defineUi () { return new Promise( (resolve, reject) => {
    this.serverRequest = getJSON(this.props.uiSettingsJsonUrl)
    .then( result => {
      var checkedResults = this.checkResult(result.data);
      if (checkedResults === true) {
        resolve(result.data);
      } else {
        // Post Errors
        var errors = [];
        for (var i = 0; i < checkedResults.length; i++) {
          errors.push({ message: checkedResults[i] })
        }
        this.setState({ caughtErrors: errors }, reject);
      }
    });
  })}

  setupEditor () { return new Promise((resolve) => {
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
  })}

  componentDidMount () {
    TemplateSpecActions.setSpecs({templateId: parseInt(this.props.templateId, 10)});
    this.setupEditor().then(() => this.editorSetupDidComplete());
  }

  editorSetupDidComplete () {
    // This doesn't mean that the images and such have acutally loaded,
    // so the height of the editor is not yet determined, etc.
    setTimeout(() => adjustColorbox(), 500)
  }

  componentWillUnmount () {
    this.serverRequest.abort();
  }

  handleResolutionIdChange (id) {
    this.setState({
      resolutionId: id
    })
  }

  handlePreviewChange (e) {
    this.setState({
      isPreview: e.target.checked
    })
  }

  populateOrderUi () {
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
  }

  handlePlaceOrder () {
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
        setTimeout(function(){ find('form input[type="submit"]')[0].click(); }, 100);
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
  }

  handleChooseSong (audioInfo) {
    this.setState({audioInfo: audioInfo})
  }

  render() {
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
    var specFields = (<span></span>);
    if (this.state.ui !== undefined) {
      specFields = (
        <SpecFields
          templateType={ this.props.templateType}
          uiSections={this.state.ui}
          imageBank={ this.state.imageBank }
        />
      );
    }

    return (
      <div className="reactBasicTemplateEditor-App">
        <h1 className="reactBasicTemplateEditor-App-title">
          <span>Template {this.props.templateId}</span>
        </h1>
        <Messages messages={this.state.caughtErrors} typeOverride="bad"/>
        <div className="reactBasicTemplateEditor-App-formArea">
            <div className="reactBasicTemplateEditor-App-column">
            { specFields }
          </div>
          <div className="reactBasicTemplateEditor-App-column">
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
          className="reactBasicTemplateEditor-App-submissionModalSuccess"
          overlayClassName="reactBasicTemplateEditor-App-submissionModalSuccessOverlay"
          contentLabel="Submission Modal"
        >
          Your order is being submitted.
        </Modal>
      </div>
    );
  }
}

export default App;
