import 'core-js/fn/object/assign';
import React from 'react';
import ReactDOM from 'react-dom';
//import App from './components/Main';


import {CheckBox, RadioGroup, clone} from './components/imports';
import fakeTemplateInfo from './stores/fakeTemplateInfo';
import {styleVars, styles} from './styles/styles.js';

window.React = React;
window.ReactDOM = ReactDOM;

// Depends on jQuery and Flixpress.js (needs the jxon stuff)

var flixpressLocation = false;
var promiseFlixpress = $.Deferred();
if (window.Flixpress) {
  flixpressLocation = window;
  promiseFlixpress.resolve()
} else if (window.parent.Flixpress) {
  flixpressLocation = window.parent;
  promiseFlixpress.resolve();
} else {
  $.getScript('/Scripts/flixpress-js/flixpress.js').done(function() {
    flixpressLocation = window;
    promiseFlixpress.resolve();
  });
}
var Flixpress = function () {
  return flixpressLocation.Flixpress;
}


var TextField = React.createClass({
  handleTextEdit: function(event){
    this.props.onUserInput(
      this.props.fieldName,
      event.target.value
    );
  },
  
  handleFocus: function () {
    this.props.onTextFieldFocus(this.props.fieldName);
  },
  
  render: function(){
    return(
      <label style={styles.label} htmlFor={this.props.fieldName}>
        {this.props.fieldName}:
        <input 
          type="text"
          name={this.props.fieldName}
          value={this.props.userText}
          onChange={this.handleTextEdit}
          onFocus={this.handleFocus}
        />
      </label>
    )
  }
});

var PreviewImage = React.createClass({
  getInitialState: function () {
    return {style: styles.previewImage}
  },
  
  componentWillReceiveProps: function(newProps) {
    if (newProps.image != this.props.image && newProps.image !== '') {
      var style = clone(this.state.style);
      style.backgroundImage = `url("/templates/images/${newProps.image}")`;
      this.setState({style: style});
    }
  },
  
  render: function(){
    return (
      <div style={this.state.style}></div>
    );
  }
});

var Message = React.createClass({
  render: function () {
    return (
      <div style={styles.messages[this.props.type]}>
        {this.props.message}
      </div>
    )
  }
});

var Errors = React.createClass({
  emptyStyle: {display: 'none'},
  
  render: function () {
    var caughtErrorsArr = this.props.caughtErrors;
    var errors = [];

    for (var i = 0; i < caughtErrorsArr.length; i++) {
      errors.push(
        <Message key={i} message={caughtErrorsArr[i].message} type="error" />
      );
    }

    if (errors.length !== 0) {
      return (<div>{errors}</div>)
    } else {
      return (<div style={this.emptyStyle}></div>);
    }
  }
});

// Returns true if it passes, or an array of strings describing
// why it didn't pass.
function checkResult (results, userSettingsData) {
  var messages = [];
  // Template Id's match?
  if (results.templateId !== userSettingsData.templateId) {
    messages.push(`Template IDs do not match. This page reports: ${userSettingsData.templateId}, JSON file reports: ${results.templateId}`);
  }
  
  if (messages.length === 0){
    return true;
  } else {
    return messages;
  }
}

var SubmitRender = React.createClass({
  componentWillMount: function () {
    // Remove old submit button
    $('input[name="Submit_BT"]').remove();
  },
  render: function () {
    var text = (this.props.isPreview) ? 'Render Preview' : 'Submit Order'
    return (
      <input name="Submit_BT" value={text} type="submit" id="Submit_BT" />
    )
  }
});

var ResolutionPicker = React.createClass({
  handleResolutionChange: function (value) {
    this.props.resolutionIdChange(parseInt(value,10));
  },
  render: function () {
    var resolutionOptions = this.props.resolutionOptions;
    if (resolutionOptions === undefined){
      resolutionOptions = [];
    }
    var checked = this.props.chosen.toString();
    var options = resolutionOptions.map(function (resObj){
      return {
        id: resObj.id.toString(),
        name: resObj.name
      };
    })
    var messageStyle = {
      visibility: (this.props.disabled ? 'visible' : 'hidden')
    };
    return (
      <div>
        <RadioGroup 
          options={options}
          value={checked}
          valueName="id"
          labelName="name"
          onChange={this.handleResolutionChange}
        />
        <div style={messageStyle}>
          Previews render at 360p with a watermark.
          Choosing a resolution for a preview will allow you
          to order your desired resolution right from the
          Previews tab of the My Account page.
        </div>
      </div>
    );
  }
});

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
      soundUi = (<SoundPicker audioInfo={this.state.audioInfo}/>);
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

var SoundPicker = React.createClass({
  render: function () {
    return (
      <div>
        <div>{this.props.audioInfo.name}</div>
        <ReactAudioPlayer src={this.props.audioInfo.audioUrl}/>
      </div>
    )
  }
});

var ReactAudioPlayer = React.createClass({
  componentDidMount() {
    const audio = this.refs.audio;

    audio.addEventListener('error', (e) => {
      this.props.onError && this.props.onError(e);
    });

    // When enough of the file has downloaded to start playing
    audio.addEventListener('canplay', (e) => {
      this.props.onCanPlay && this.props.onCanPlay(e);
    });

    // When enough of the file has downloaded to play the entire file
    audio.addEventListener('canplaythrough', (e) => {
      this.props.onCanPlayThrough && this.props.onCanPlayThrough(e);
    });

    // When audio play starts
    audio.addEventListener('play', (e) => {
      this.setListenTrack();
      this.props.onPlay && this.props.onPlay(e);
    });

    // When unloading the audio player (switching to another src)
    audio.addEventListener('abort', (e) => {
      this.clearListenTrack();
      this.props.onAbort && this.props.onAbort(e);
    });

    // When the file has finished playing to the end
    audio.addEventListener('ended', (e) => {
      this.clearListenTrack();
      this.props.onEnd && this.props.onEnd(e);
    });

    // When the user pauses playback
    audio.addEventListener('pause', (e) => {
      this.clearListenTrack();
      this.props.onPause && this.props.onPause(e);
    });

    // When the user drags the time indicator to a new time
    audio.addEventListener('seeked', (e) => {
      this.clearListenTrack();
      this.props.onSeeked && this.props.onSeeked(e);
    });
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedPlayerEvent) {
      const audio = this.refs.audio;

      audio.currentTime = nextProps.selectedPlayerEvent.playTime;
      audio.play();
    }
  },

  render() {
    const incompatibilityMessage = this.props.children || (
      <p>Your browser does not support the <code>audio</code> element.</p>
    );

    return (
      <audio
        className="react-audio-player"
        src={this.props.src}
        autoPlay={this.props.autoPlay}
        preload={this.props.preload}
        controls
        ref="audio"
        onPlay={this.onPlay}
      >
        {incompatibilityMessage}
      </audio>
    );
  },

  /**
   * Set an interval to call props.onListen every props.listenInterval time period
   */
  setListenTrack(currentTime) {
    if (!this.listenTracker) {
      const listenInterval = this.props.listenInterval || DEFAULT_LISTEN_INTERVAL;
      this.listenTracker = setInterval(() => {
        this.props.onListen(this.refs.audio.currentTime);
      }, listenInterval);
    }
  },

  /**
   * Clear the onListen interval
   */
  clearListenTrack() {
    clearInterval(this.listenTracker);
  },
});

var EditingUi = React.createClass({
  getInitialState: function () {
    return {
      lastTextFocus: '',
      previewImage: ''
    };
  },

  getPreviewImage: function (type, identifier) {
    var safeName = identifier.replace(' ','-');
    if (type === 'TextField') {
      return this.props.allTextFields[identifier].previewImage
    
    } else if (type === 'DropDown') {
      for (var i = this.props.allDropDowns[identifier].options.length - 1; i >= 0; i--) {
        if (this.props.allDropDowns[identifier].options[i].value === this.refs[`select-${safeName}`].value) {
          return this.props.allDropDowns[identifier].options[i].previewImage;
        }
      }
    }
    
    return this.state.previewImage;
  },

  handleTextFocus: function (fieldName) {
    var img = this.getPreviewImage('TextField', fieldName);
    this.setState({lastTextFocus: fieldName, previewImage: img});
  },
  
  createTextField: function (name, object) {
    var safeName = name.replace(' ','-');
    return (<TextField
      fieldName={name}
      userText={object.value}
      onUserInput={this.props.onFieldsChange}
      onTextFieldFocus={this.handleTextFocus}
      key={`text-field-${safeName}`}
    />);
  },
  
  createDropDown: function (name, object) {
    var safeName = name.replace(' ','-');
    var options = [];
    var theDefault = object.default;
    
    var onDropDownChange = function () {
      this.props.onDropDownChange(this.refs[`select-${safeName}`], name);
      this.setState({previewImage: this.getPreviewImage('DropDown', name)})
    }.bind(this);
    
    for (var i = 0; i < object.options.length; i++) {
      var option = object.options[i]
      options.push(
        <option 
          key={`${safeName}-option-${option.value}`}
          value={option.value}
        >
          {option.name}
        </option>
      )
    }
    
    return (
      <label> {name}:
        <select
          key={`drop-down-${safeName}`}
          ref={`select-${safeName}`}
          onChange={onDropDownChange}
          onFocus={onDropDownChange}
          defaultValue={theDefault}
          value={this.props.allDropDowns[name].value}
        >
         {options}
        </select>
      </label>
    )
  },
  
  createSection: function (sectionName, inputArray) {
    var components = [];
    for (var i = 0; i < inputArray.length; i++) {
      var name = inputArray[i].name;
      var object = this.props['all' + inputArray[i].type + 's'][name];
      components.push(this['create' + inputArray[i].type](name, object));
    }
    var safeName = sectionName.replace(' ','-');
    return (
      <div key={`section-${safeName}`}>
        <h3>{sectionName}</h3>
        {components}
      </div>
    )
  },
  
  render: function () {
    var uiSections = this.props.uiSections
    var sections = [];
    for (var i = 0; i < uiSections.length; i++) {
      for (var sectionName in uiSections[i]){
        sections.push(this.createSection(sectionName, uiSections[i][sectionName]));
      }
    }
    return (
      <div>
        {sections}
        <PreviewImage image={this.state.previewImage} />
      </div>
    );
  }
});

// someday:
// export default EditorUserInterface;
// for now:
window.EditorUserInterface = EditorUserInterface;
