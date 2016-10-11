import React from 'react';

import {clone, promiseFlixpress} from './imports';

import Messages from './UserMessages';
import SubmitRender from './SubmitRender';
import ResolutionPicker from './ResolutionPicker';
import EditingUi from './EditingUi';
import SoundPicker from './SoundPicker';
import Modal from 'react-modal';

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
    promiseFlixpress.done(function(Flixpress){
      var startingPoint = Flixpress.td.getReactStartingData();
      var currentState = clone(this.state);
      var stateToMerge = clone(startingPoint);

      stateToMerge.defaultResolutionId = startingPoint.resolutionId;
      
      if (startingPoint.nameValuePairs !== undefined) {
        var dataTypeContainers = ['textFields', 'dropDowns'];
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
    }.bind(this));
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
    .fail(function(){
      $returnPromise.reject();
    });
    return $returnPromise;
  },
  
  componentDidMount: function () {
    this.tryJsonFile()
    .fail(()=>{
      this.setState({
        caughtErrors: [{message: 'Could not load template data.'}]
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

  handleDropDownChange: function (selectElement, ddName) {
    var ddState = this.state.dropDowns;
    ddState[ddName].value = selectElement.value;
    this.setState({dropDowns: ddState});
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
            
            order.ui[i][key][j].value = this.state[type][name].value;
          }
        }
      }
    }
    
    var orderPromise = $.Deferred();
    
    promiseFlixpress.done(function(Flixpress) {
      Flixpress.td.updateXmlForOrder(order)
        .done(function(){
          orderPromise.resolve()
        })
        .fail(function(failureReason){
          orderPromise.reject(failureReason)
        })
    });
    
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
          allDropDowns={this.state.dropDowns}
          onFieldsChange={this.handleFieldsChange}
          onDropDownChange={this.handleDropDownChange}
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
