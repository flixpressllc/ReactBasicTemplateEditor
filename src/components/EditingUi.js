import React from 'react';
import TextField from './TextField';
import PreviewImage from './PreviewImage';

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

export default EditingUi;