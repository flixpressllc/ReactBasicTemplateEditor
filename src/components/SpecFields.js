import React from 'react';
import TextField from './TextField';
import TextBox from './TextBox';
import PreviewImage from './PreviewImage';
import ColorPicker from './ColorPicker';
import YouTubeLink from './YouTubeLink';
import ImageContainer from './ImageContainer';
import DropDown from './DropDown';
import RenderDataStore from '../stores/RenderDataStore';

import { getContainerNameFor } from '../utils/globalContainerConcerns';
import { firstCharToLower, isEmpty } from '../utils/helper-functions';

import './SpecFields.scss';

var SpecFields = React.createClass({
  getInitialState: function () {
    return {
      previewImageName: '',
      previewImageType: ''
    };
  },
  
  subscribeToChanges: function () {
    const forceUpdate = this.forceUpdate.bind(this);
    this.forceUpdateAfterChange = function () {
      forceUpdate();
    }
    RenderDataStore.on('change', this.forceUpdateAfterChange);
  },
  
  unsubscribeFromChanges: function () {
    RenderDataStore.removeEventListener('change', this.forceUpdateAfterChange);
  },

  componentDidMount: function () {
    this.findFirstPreviewImage();
    this.subscribeToChanges();
  },
  
  componentWillUnmount: function () {
    this.unsubscribeFromChanges();
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

  createTextField: function (name, object) {
    var safeName = name.replace(' ','-');
    // TODO: The object passed in contains the value and settings all in the same
    // dimension. These maybe should be filtered or passed in in an actual settings
    // object inside the enclosing object.
    return (<TextField
      fieldName={name}
      settings={object}
      value={ object.value }
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
        key={`text-field-${safeName}`}
      />
    );
  },

  createYouTubeLink: function (name, object) {
    var safeName = name.replace(' ','-');
    return (<YouTubeLink
      fieldName={name}
      userText={object.value}
      onTextFieldFocus={this.handleYouTubeLinkFocus}
      key={`you-tube-link-${safeName}`}
    />);
  },

  createTextBox: function (name, object) {
    var safeName = name.replace(' ','-');
    return (<TextBox
      fieldName={name}
      userText={object.value}
      onTextBoxFocus={this.handleTextBoxFocus}
      key={`text-box-${safeName}`}
    />);
  },

  createColorPicker: function (name, object) {
    var safeName = name.replace(' ','-');
    return (<ColorPicker
      fieldName={name}
      color={object.value}
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
    let containers = RenderDataStore.getAll();
    for (var i = 0; i < inputArray.length; i++) {
      var fieldName = inputArray[i].name;
      var type = inputArray[i].type;
      var containerName = getContainerNameFor(firstCharToLower(type));
      var object = containers[containerName][fieldName];
      components.push(this['create' + type](fieldName, object));
    }
    var safeName = sectionName.replace(' ','-');
    return (
      <div className="reactBasicTemplateEditor-SpecFields-section"
        key={`section-${safeName}`}>
        <h3 className="reactBasicTemplateEditor-SpecFields-sectionTitle">{sectionName}</h3>
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
        <div className="reactBasicTemplateEditor-SpecFields-sections">
          { sections }
        </div>
        <PreviewImage
          name={this.state.previewImageName}
          type={ this.state.previewImageType }/>
      </div>
    );
  }
});

export default SpecFields;
