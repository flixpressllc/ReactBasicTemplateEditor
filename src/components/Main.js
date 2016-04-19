import React from 'react';

import {CheckBox, clone, promiseFlixpress} from './imports';
var fakeTemplateInfo = require('../stores/fakeTemplateInfo.json');

import {Errors, SubmitRender, ResolutionPicker} from './everythingElse';
import EditingUi from './EditingUi';
import SoundPicker from './SoundPicker';

require('reset.css');
require('../styles/App.css');

var EditorUserInterface = React.createClass({
  getInitialState: function() {
    return {
      allowSubmit: false,
      textFields: {},
      caughtErrors: []
    };
  },

  componentWillMount: function () {
    var _this = this;
    $('form').on('submit', function(e){
      _this.handleSubmit(e);
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
    if (results.templateId !== userSettingsData.templateId) {
      messages.push(`Template IDs do not match. This page reports: ${userSettingsData.templateId}, JSON file reports: ${results.templateId}`);
    }
    
    if (messages.length === 0){
      return true;
    } else {
      return messages;
    }
  },
  
  componentDidMount: function () {
    this.serverRequest = $.getJSON(this.props.uiSettingsJsonUrl, function (result) {
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
      this.setState({
        caughtErrors: [{message: 'could not load template data'}]
      });
      // !!!! ---- TESTING ONLY
      // !!!! ---- TESTING ONLY
      // !!!! ---- TESTING ONLY
      if (fakeTemplateInfo.hasOwnProperty(this.props.userSettingsData.templateId).toString()){
        
        this.setState(fakeTemplateInfo[this.props.userSettingsData.templateId], this.getStartingData);
        
        var doStyleSwap = function () {
          var oldStyle = $('head').find('[href="https://files.digital-edge.biz/templates/Styles/editor.css"]');
          $('head').append('<link rel="stylesheet" href="https://files.digital-edge.biz/templates/Styles/editor.css" type="text/css" />')
          oldStyle.remove();
        };
        doStyleSwap();
        
        var swapTimer;
        window.styleSwap = function (int) {
          if (int !== undefined){
            swapTimer = window.setInterval(doStyleSwap, int);
          } else {
            clearInterval(swapTimer);
          }
        }
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
    
    var orderPromise = $.Deferred();
    
    promiseFlixpress.done(function(Flixpress) {
      Flixpress.td.updateXmlForOrder(order)
        .always(function(failureReason){
          orderPromise.resolve(failureReason)
        })
    });
    
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
      <div>
        <h1>Editing Template {this.props.userSettingsData.templateId}</h1>
        <Errors caughtErrors={this.state.caughtErrors}/>
        {editingUi}
        <SoundPicker
          audioInfo={this.state.audioInfo}
          username={this.props.userSettingsData.username}
          onChooseSong={this.handleChooseSong}
        />
        {resolutionPicker}
        <CheckBox onChange={this.handlePreviewChange} checked={this.state.isPreview}>Preview</CheckBox>
        <SubmitRender isPreview={this.state.isPreview}/>
      </div>
    );
  }
});

export default EditorUserInterface;
