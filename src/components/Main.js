import React from 'react';

import {CheckBox, clone, Flixpress, promiseFlixpress} from './imports';
import fakeTemplateInfo from '../stores/fakeTemplateInfo';

import {Errors, checkResult, SubmitRender, ResolutionPicker, EditingUi} from './everythingElse';
import SoundPicker from './SoundPicker';

var EditorUserInterface = React.createClass({
  getInitialState: function() {
    return {
      allowSubmit: false,
      textFields: {},
      caughtErrors: [],
    };
  },

  componentWillMount: function () {
    var _this = this;
    $('form').on('submit', function(e){
      _this.handleSubmit(e);
    });
  },
  
  getStartingData: function () {
    promiseFlixpress.done(function(){
      var startingPoint = Flixpress().td.getReactStartingData();
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
  
  componentDidMount: function () {
    this.serverRequest = $.getJSON(this.props.uiSettingsJsonUrl, function (result) {
      var checkedResults = checkResult(result, this.props.userSettingsData);
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
      this.setState({
        caughtErrors: [{message: 'could not load template data'}]
      });
      // !!!! ---- TESTING ONLY 
      // !!!! ---- TESTING ONLY 
      // !!!! ---- TESTING ONLY 
      if (fakeTemplateInfo.hasOwnProperty(this.props.userSettingsData.templateId).toString()){
        this.setState(fakeTemplateInfo[this.props.userSettingsData.templateId], this.getStartingData)
      }
      // !!!! ---- TESTING ONLY 
      // !!!! ---- TESTING ONLY 
      // !!!! ---- TESTING ONLY 
    }.bind(this));
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

  handleSubmit: function (e) {
    if (this.state.allowSubmit === false){
      e.preventDefault();
      this.confirmOrder();
    }
  },

  handlePreviewChange: function (e) {
    this.setState({
      isPreview: e.target.checked
    })
  },

  confirmOrder: function () {
    if (this.state.isPreview !== true) {
      if (confirm('Would you like to submit the order? This action will use your render minutes.')){
        this.placeOrder();
      }
    } else {
      this.placeOrder();
    }
  },
  
  placeOrder: function () {
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
    
    var orderPromise = Flixpress().td.updateXmlForOrder(order);
    
    orderPromise.done(function(){
      this.setState({allowSubmit: true}, function () {
        $('form').submit();
      })
    }.bind(this)).fail(function(failureReason){
      this.setState({
        caughtErrors: [
          {message: 'Order Failed.'}
        ]
      })
      console.log('Sent Object:',order);
      console.error('Order Failure: ' + failureReason);
    }.bind(this));
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
    var soundUi = (<span></span>);
    if (this.state.audioInfo !== undefined) {
      soundUi = (<SoundPicker audioInfo={this.state.audioInfo} username={this.props.userSettingsData.username}/>);
    }
    return (
      <div>
        <h1>Editing Template {this.props.userSettingsData.templateId}</h1>
        <Errors caughtErrors={this.state.caughtErrors}/>
        {editingUi}
        {soundUi}
        {resolutionPicker}
        <CheckBox onChange={this.handlePreviewChange} checked={this.state.isPreview}>Preview</CheckBox>
        <SubmitRender isPreview={this.state.isPreview}/>
      </div>
    );
  }
});

export default EditorUserInterface;
