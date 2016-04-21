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
      let defaultValue = this.props.allDropDowns[identifier].default
      for (var i = this.props.allDropDowns[identifier].options.length - 1; i >= 0; i--) {
        let value = this.props.allDropDowns[identifier].options[i].value;
        let isMounted = this.refs[`select-${safeName}`] !== undefined;
        let mountedValue = isMounted ? this.refs[`select-${safeName}`].value : -1 ;
        // If the component is mounted and values match, that's the one
        // If the component is NOT mounted, and the value matches the default, that's the one
        if ((isMounted && value === mountedValue) || (!isMounted && defaultValue === value)) {
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
      className="input-item"
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
      <div className="drop-down component input-item">
        <label>{name}</label>
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
      </div>
    )
  },
  
  findFirstPreviewImage: function (fieldType, fieldName) {
    if (this.state.foundFirstPreviewImage === true) return;
    var image = this.getPreviewImage(fieldType, fieldName);
    if (image !== '') {
      this.setState({previewImage: image, foundFirstPreviewImage: true});
    }
  },
  
  createSection: function (sectionName, inputArray) {
    var components = [];
    for (var i = 0; i < inputArray.length; i++) {
      var name = inputArray[i].name;
      var object = this.props['all' + inputArray[i].type + 's'][name];
      this.findFirstPreviewImage(inputArray[i].type, name);
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
      <div id="editing-ui" className="editing-ui component">
        {sections}
        <PreviewImage image={this.state.previewImage} />
      </div>
    );
  }
});

export default EditingUi;