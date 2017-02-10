import React from 'react';
import TextField from './TextField';
import TextBox from './TextBox';
import PreviewImage from './PreviewImage';
import ColorPicker from './ColorPicker';
import YouTubeLink from './YouTubeLink';
import ImageContainer from './ImageContainer';
import DropDown from './DropDown';

import { getContainerNameFor } from '../utils/globalContainerConcerns';
import { firstCharToLower, firstCharToUpper, isEmpty } from '../utils/helper-functions';

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

  handleDropDownFocus: function (fieldName) {
    this.setState({previewImageName: fieldName, previewImageType: 'DropDown'});
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
    // TODO: The object passed in contains the value and settings all in the same
    // dimension. These maybe should be filtered or passed in in an actual settings
    // object inside the enclosing object.
    return (<TextField
      fieldName={name}
      settings={object}
      value={ object.value }
      onUserInput={this.props.onFieldsChange}
      onTextFieldFocus={this.handleTextFocus}
      key={`text-field-${safeName}`}
    />);
  },

  createUserImageChooser: function (name, object) {
    var safeName = name.replace(' ','-');
    if (isEmpty(object.containedImages)) return null;
    return (
      <ImageContainer
        fieldName={ name }
        images={ object.containedImages }
        captions={ object.captions }
        imageBank={ this.props.imageBank }
        onUpdateImages={ this.props.onUpdateImages }
        key={`text-field-${safeName}`}
      />
    );
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
    return (<DropDown
      fieldName={ name }
      defaultValue={ object.default }
      value={ object.value }
      options={ object.options }
      onDropDownChange={ this.props.onDropDownChange }
      onDropDownFocus={ this.handleDropDownFocus }
      key={`drop-down-${safeName}`} />
    );
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
      var container = 'all' + firstCharToUpper(getContainerNameFor(firstCharToLower(type)));
      var object = this.props[container][name];
      components.push(this['create' + type](name, object));
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
        { sections }
        <PreviewImage
          name={this.state.previewImageName}
          type={ this.state.previewImageType }
          fields={ fieldsObj }/>
      </div>
    );
  }
});

export default EditingUi;
