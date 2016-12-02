import React from 'react';
import TextField from './TextField';
import TextBox from './TextBox';
import PreviewImage from './PreviewImage';
import ColorPicker from './ColorPicker';
import YouTubeLink from './YouTubeLink';

var EditingUi = React.createClass({
  getInitialState: function () {
    return {
      lastTextFocus: '',
      previewImage: ''
    };
  },
  
  componentDidMount: function () {
    this.findFirstPreviewImage();
  },

  getPreviewImage: function (type, identifier, value) {
    if (type === 'TextField') {
      return this.props.allTextFields[identifier].previewImage
    
    } else if (type === 'YouTubeLink') {
      return this.props.allYouTubeLinks[identifier].previewImage
    
    } else if (type === 'TextBox') {
        return this.props.allTextBoxes[identifier].previewImage
      
    } else if (type === 'DropDown') {
      for (var i = this.props.allDropDowns[identifier].options.length - 1; i >= 0; i--) {
        if (this.props.allDropDowns[identifier].options[i].value === value) {
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
  
  handleYouTubeLinkFocus: function (fieldName) {
    var img = this.getPreviewImage('YouTubeLink', fieldName);
    this.setState({lastTextFocus: fieldName, previewImage: img});
  },
  
  handleTextBoxFocus: function (fieldName) {
    var img = this.getPreviewImage('TextBox', fieldName);
    this.setState({lastTextBoxFocus: fieldName, previewImage: img});
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
  
  createYouTubeLink: function (name, object) {
    var safeName = name.replace(' ','-');
    return (<YouTubeLink
      fieldName={name}
      className="input-item"
      userText={object.value}
      onUserInput={this.props.onYouTubeLinksChange}
      onTextFieldFocus={this.handleYouTubeLinkFocus}
      onValidVideoFound={this.props.onValidVideoFound}
      key={`you-tube-link-${safeName}`}
    />);
  },
  
  createTextBox: function (name, object) {
    var safeName = name.replace(' ','-');
    return (<TextBox
      fieldName={name}
      className="input-item"
      userText={object.value}
      onUserInput={this.props.onTextBoxesChange}
      onTextBoxFocus={this.handleTextBoxFocus}
      key={`text-box-${safeName}`}
    />);
  },
  
  createColorPicker: function (name, object) {
    var safeName = name.replace(' ','-');
    return (<ColorPicker
      fieldName={name}
      className="input-item color-picker"
      color={object.value}
      onColorChange={this.props.onColorPickerChange}
      key={`color-picker-${safeName}`}
    />);
  },
  
  createDropDown: function (name, object) {
    var safeName = name.replace(' ','-');
    var options = [];
    var theDefault = object.default;
    var _thisDD; // will be set after the component mounts.
    
    var onDropDownChange = function () {
      this.props.onDropDownChange(_thisDD, name);
      this.setState({previewImage: this.getPreviewImage('DropDown', name, _thisDD.value)})
    }.bind(this);
    
    
    var _thisDDMounted = (ref) => {
      // set our local static variable to start...
      _thisDD = ref;
      // if there is no value chosen for the dropdown yet...
      if (this.props.allDropDowns[name].value === undefined) {
        // ...tell props that we've chosen the default to start
        this.props.onDropDownChange(_thisDD, name);
      }
    };
    
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
      <div className="drop-down component input-item" key={`drop-down-${safeName}`}>
        <label>{name}</label>
        <select
          ref={_thisDDMounted}
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
  
  findFirstPreviewImage: function () {
    let uiSections = this.props.uiSections;
    for (let i = 0; i < uiSections.length; i++) {
      for (let sectionName in uiSections[i]){
        let inputArray = uiSections[i][sectionName]

        for (let i = 0; i < inputArray.length; i++) {
          let image = this.getPreviewImage(inputArray[i].type, inputArray[i].name);
          if (image !== '') {
            this.setState({previewImage: image});
            return;
          }
        }
      }
    }
    // probably the first inner component with a preview image
    // hasn't mounted yet. This is a hack, but we'll call again...
    setTimeout(this.findFirstPreviewImage,500);
  },
  
  createSection: function (sectionName, inputArray) {
    var components = [];
    for (var i = 0; i < inputArray.length; i++) {
      var name = inputArray[i].name;
      var type = inputArray[i].type;
      var container = 'all' + type + 's';
      container = (container == 'allTextBoxs') ? 'allTextBoxes' : container; // TODO: fix this hack
      var object = this.props[container][name];
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