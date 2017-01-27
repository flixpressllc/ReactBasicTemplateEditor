import React from 'react';
import {clone} from './imports';
import { getJSON } from '../utils/ajax';
import { find } from '../utils/dom-queries';
import { traverseObject } from '../utils/helper-functions';
import * as renderDataAdapter from '../utils/renderDataAdapter';
import * as dc from '../utils/globalContainerConcerns';

import Messages from './UserMessages';
import SubmitRender from './SubmitRender';
import ResolutionPicker from './ResolutionPicker';
import EditingUi from './EditingUi';
import SoundPicker from './SoundPicker';
import Modal from 'react-modal';

import './EditorUserInterface.scss';

const MOVED_NAMES = dc.getContainerNames();
const UNMOVED_NAMES = ['dropDowns', 'textBoxes', 'colorPickers', 'youTubeLinks']
const DATA_CONTAINER_NAMES = UNMOVED_NAMES.concat(MOVED_NAMES);

var EditorUserInterface = React.createClass({
  getInitialState: function() {
    return {
      allowSubmit: false,
      caughtErrors: [],
      userImages: []
    };
  },

  handlePlacePreviewOrder: function () {
    this.setState({isPreview: true}, function () {
      this.handlePlaceOrder();
    });
  },

  extractAndReplacePreviewRenderValues: function (stateToMerge) {
    if (stateToMerge.nameValuePairs === undefined) return stateToMerge;

    let nameValuePairsObj = stateToMerge.nameValuePairs.reduce((a, pair) => {
      a[pair.name] = pair.value;
      return a;
    }, {});
    let nameValuePairsArray = stateToMerge.nameValuePairs;
    delete stateToMerge.nameValuePairs;

    let currentContainerState = DATA_CONTAINER_NAMES.reduce((a, containerName) => {
      if(!this.state.hasOwnProperty(containerName)) return a;
      a[containerName] = clone(this.state[containerName]);
      return a;
    }, {});

    stateToMerge = Object.assign({}, stateToMerge, currentContainerState);

    DATA_CONTAINER_NAMES.map((containerName) => {
      console.log(containerName)
      if (MOVED_NAMES.indexOf(containerName) > -1) {
        // do the new stuff
        stateToMerge[containerName] = traverseObject(stateToMerge[containerName], (formIdName, obj) => {
          return [formIdName, dc.getToDataObjectFunctionFor(dc.getDataTypeNameFor(containerName))(nameValuePairsObj[formIdName], obj)];
        })
      } else {
        // do the old stuff
        stateToMerge[containerName] = traverseObject(stateToMerge[containerName], (formIdName, obj) => {
          obj.value = nameValuePairsObj[formIdName];
          if (containerName === 'youTubeLinks') {
            obj = Object.assign({}, obj, this.transformYouTubeRenderStringToData(nameValuePairsObj[formIdName]));
          }
          return [formIdName, obj];
        })
      }
    });

    // done with this now
    return stateToMerge;
  },

  getStartingData: function () { return new Promise((resolve) => {
    let stateToMerge = renderDataAdapter.getReactStartingData();
    stateToMerge = this.extractAndReplacePreviewRenderValues(stateToMerge);
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

  setupEditor: function () { return new Promise((resolve, reject) => {
    let defineUi = this.defineUi()
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

  handleUpdateImages: function (newArray) {
    this.setState({userImages: newArray});
  },

  transformYouTubeDataToRenderString: function (linkObj) {
    if (linkObj.title === undefined || linkObj.videoId === undefined) {
      return '';
    }
    linkObj.title = linkObj.title.replace('|',' ');
    linkObj.time = linkObj.time || '';
    return [linkObj.title, linkObj.videoId, linkObj.time].join('|');
  },

  transformYouTubeRenderStringToData: function (renderString) {
    let linkObj = {};

    const parts = renderString.split('|');
    linkObj.title = parts[0];
    linkObj.videoId = parts[1];
    linkObj.time = parts[2];
    linkObj.value = linkObj.videoId; // This is what gets displayed
    return linkObj;
  },

  handlePlaceOrder: function () {
    var order = {};

    // add necessaries
    order.ui = this.state.ui;
    order.isPreview = this.state.isPreview;
    order.audioInfo = this.state.audioInfo;
    order.resolutionId = this.state.resolutionId;

    // add values to order.ui
    for (var i = 0; i < order.ui.length; i++) {
      for (var key in order.ui[i]) {
        if (order.ui[i].hasOwnProperty(key)) {
          for (var j = 0; j < order.ui[i][key].length; j++) {
            var name = order.ui[i][key][j].name;
            var type = order.ui[i][key][j].type;

            // convert things like 'TextField' to 'textFields'
            type = type.charAt(0).toLowerCase() + type.slice(1) + 's';
            type = (type == 'textBoxs') ? 'textBoxes' : type; // TODO: fix this hack

            if (type === 'youTubeLinks') {
              if (this.state[type][name]) {
                let ytDataOut = this.transformYouTubeDataToRenderString(clone(this.state[type][name]));
                order.ui[i][key][j].value = ytDataOut;
              } else {
                order.ui[i][key][j].value = '';
              }
            } else {
              // assure that a value exists
              if (!this.state[type][name].value) {
                order.ui[i][key][j].value = '';
              } else {
                order.ui[i][key][j].value = this.state[type][name].value.toString();
              }
            }

          }
        }
      }
    }

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
          userImages={ this.state.userImages }
          onUpdateImages={ this.handleUpdateImages }
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
