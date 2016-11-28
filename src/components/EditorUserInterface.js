import React from 'react';

import {clone} from './imports';

import Messages from './UserMessages';
import SubmitRender from './SubmitRender';
import ResolutionPicker from './ResolutionPicker';
import EditingUi from './EditingUi';
import SoundPicker from './SoundPicker';
import Modal from 'react-modal';
import xmlParser from '../utils/xml-parser';

var EditorUserInterface = React.createClass({
  getInitialState: function() {
    return {
      allowSubmit: false,
      textFields: {},
      caughtErrors: []
    };
  },

  handlePlacePreviewOrder: function () {
    this.setState({isPreview: true},function () {
      this.handlePlaceOrder();
    });
  },

  getStartingData: function () {
    var startingPoint = xmlParser.getReactStartingData();
    var currentState = clone(this.state);
    var stateToMerge = clone(startingPoint);

    stateToMerge.defaultResolutionId = startingPoint.resolutionId;
    
    if (startingPoint.nameValuePairs !== undefined) {
      var dataTypeContainers = ['textFields', 'dropDowns', 'textBoxes', 'colorPickers', 'youTubeLinks'];
      var confirmedContainers = [];
      for (var i = dataTypeContainers.length - 1; i >= 0; i--) {
        if (currentState.hasOwnProperty(dataTypeContainers[i])) {
          stateToMerge[dataTypeContainers[i]] = clone(currentState[dataTypeContainers[i]]);
          confirmedContainers.push(dataTypeContainers[i]);
        }
      }
      
      for (var i = 0; i < startingPoint.nameValuePairs.length; i++) {
        var name = startingPoint.nameValuePairs[i].name;
        var value = startingPoint.nameValuePairs[i].value;
        for (var j = confirmedContainers.length - 1; j >= 0; j--) {
          if(stateToMerge[confirmedContainers[j]].hasOwnProperty(name)){
            stateToMerge[confirmedContainers[j]][name].value = value;
          }
        }
      }
    }
    
    // done with this now
    delete stateToMerge.nameValuePairs;
    
    this.setState(stateToMerge);
  },
  
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
  
  tryJsonFile: function () {
    var $returnPromise = $.Deferred();
    this.serverRequest = $.getJSON(this.props.uiSettingsJsonUrl, function (result) {
      $returnPromise.resolve(); // The file exists. Below we check for bad data.
      var checkedResults = this.checkResult(result);
      if (checkedResults === true) {
        this.setState(result, this.getStartingData);
      } else {
        // Post Errors
        var errors = [];
        for (var i = 0; i < checkedResults.length; i++) {
          errors.push({
            message: checkedResults[i]
          })
        }
        this.setState({
          caughtErrors: errors
        })
      }
    }.bind(this))
    .fail(function(a,b,error){
      $returnPromise.reject(`${error.name}: ${error.message}`);
    });
    return $returnPromise;
  },
  
  componentDidMount: function () {
    this.tryJsonFile()
    .fail((possibleReason)=>{
      let errors = this.state.caughtErrors || [];
      errors.push({message: 'Could not load template data.'});
      if (possibleReason) { errors.push({message: possibleReason}); }
      this.setState({
        caughtErrors: errors
      });
    });
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
            
            order.ui[i][key][j].value = this.state[type][name].value;
          }
        }
      }
    }
    
    var orderPromise = $.Deferred();
    
    xmlParser.updateXmlForOrder(order)
      .done(function(){
        orderPromise.resolve()
      })
      .fail(function(failureReason){
        orderPromise.reject(failureReason)
      })
    
    orderPromise.done(function(){
      this.setState({allowSubmit: true}, function () {
        setTimeout(function(){$('form input[type="submit"]').eq(0).click();},100);
      })
    }.bind(this)).fail(function(failureReason){
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
    }.bind(this));
  },
  
  handleChooseSong: function (audioInfo) {
    this.setState({audioInfo: audioInfo})
  },
  
  render: function() {
    var resolutionPicker = (<span></span>);
    if (this.state.defaultResolutionId !== undefined) {
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
        <EditingUi uiSections={this.state.ui}
          allTextFields={this.state.textFields}
          allYouTubeLinks={this.state.youTubeLinks}
          allTextBoxes={this.state.textBoxes}
          allDropDowns={this.state.dropDowns}
          allColorPickers={this.state.colorPickers}
          onFieldsChange={this.handleFieldsChange}
          onYouTubeLinksChange={this.handleYouTubeLinksChange}
          onTextBoxesChange={this.handleTextBoxesChange}
          onDropDownChange={this.handleDropDownChange}
          onColorPickerChange={this.handleColorPickerChange}
        />
      );
    }

    return (
      <div id="editor">
        <h1 className="editor-title">
          <span>Editing Template {this.props.userSettingsData.templateId}</span>
        </h1>
        <Messages messages={this.state.caughtErrors} typeOverride="bad"/>
        <div className="main-interaction-area">
            <div className="column">
            {editingUi}
            <SoundPicker
              audioInfo={this.state.audioInfo}
              username={this.props.userSettingsData.username}
              onChooseSong={this.handleChooseSong}
            />
          </div>
          <div className="column">
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
          className="confirm-modal modal"
          overlayClassName="confirm-modal-overlay overlay"
        >
          Your order is being submitted.
        </Modal>
      </div>
    );
  }
});

export default EditorUserInterface;
