import React from 'react';

import {CheckBox, RadioGroup, clone, Flixpress, promiseFlixpress} from './imports';
import fakeTemplateInfo from '../stores/fakeTemplateInfo';
import {styleVars, styles} from '../styles/styles.js';

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

export {TextField, PreviewImage, Message, Errors, checkResult, SubmitRender, ResolutionPicker, EditingUi};