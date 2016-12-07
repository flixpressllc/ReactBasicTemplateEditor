import React from 'react';
import TextField from './TextField';
import TextBox from './TextBox';
import PreviewImage from './PreviewImage';
import ColorPicker from './ColorPicker';
import YouTubeLink from './YouTubeLink';
import './EditingUi.scss';

var EditingUi = React.createClass({
  getInitialState: function () {
    return {
      previewImageName: '',
      previewImageType: ''
    };
  },
  
  componentDidMount: function () {
    this.findFirstPreviewImage();
  },

  handleTextFocus: function (fieldName) {
    this.setState({previewImageName: fieldName, previewImageType: 'TextField'});
  },
  
  handleYouTubeLinkFocus: function (fieldName) {
    this.setState({previewImageName: fieldName, previewImageType: 'YouTubeLink'});
  },
  
  handleTextBoxFocus: function (fieldName) {
    this.setState({previewImageName: fieldName, previewImageType: 'TextBox'});
  },
  
  getFieldsForPreviewImage: function () {
    return {
      dropDowns: this.props.allDropDowns,
      textFields: this.props.allTextFields,
      youTubeLinks: this.props.allYouTubeLinks,
      textBoxes: this.props.allTextBoxes
    }
  },
  
  createTextField: function (name, object) {
    var safeName = name.replace(' ','-');
    return (<TextField
      fieldName={name}
      settings={object}
      onUserInput={this.props.onFieldsChange}
      onTextFieldFocus={this.handleTextFocus}
      key={`text-field-${safeName}`}
    />);
  },
  
  createYouTubeLink: function (name, object) {
    var safeName = name.replace(' ','-');
    return (<YouTubeLink
      fieldName={name}
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
      this.setState({previewImageName: name, previewImageType: 'DropDown'});
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
      <div className="reactBasicTemplateEditor-EditingUi-dropDown" key={`drop-down-${safeName}`}>
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
          this.setState({previewImageName: inputArray[i].name, previewImageType: inputArray[i].type});
          return;
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
        <h3 className="reactBasicTemplateEditor-EditingUi-sectionTitle">{sectionName}</h3>
        {components}
      </div>
    )
  },
  
  render: function () {
    var uiSections = this.props.uiSections
    let fieldsObj = this.getFieldsForPreviewImage();
    var sections = [];
    for (var i = 0; i < uiSections.length; i++) {
      for (var sectionName in uiSections[i]){
        sections.push(this.createSection(sectionName, uiSections[i][sectionName]));
      }
    }
    return (
      <div id="editing-ui" className="editing-ui component">
        {sections}
        <PreviewImage
          name={this.state.previewImageName}
          type={ this.state.previewImageType }
          fields={ fieldsObj }/>
      </div>
    );
  }
});

export default EditingUi;
