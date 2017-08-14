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
import { firstCharToLower, isEmpty } from 'happy-helpers';

import './SpecFields.scss';

class SpecFields extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      previewImageName: '',
      previewImageType: ''
    };

    this.handleTextFocus = this.handleTextFocus.bind(this);
    this.handleTextBoxFocus = this.handleTextBoxFocus.bind(this);
    this.handleYouTubeLinkFocus = this.handleYouTubeLinkFocus.bind(this);
    this.handleDropDownFocus = this.handleDropDownFocus.bind(this);
  }

  subscribeToChanges () {
    const forceUpdate = this.forceUpdate.bind(this);
    this.forceUpdateAfterChange = function () {
      forceUpdate();
    }
    RenderDataStore.on('change', this.forceUpdateAfterChange);
  }

  unsubscribeFromChanges () {
    RenderDataStore.removeEventListener('change', this.forceUpdateAfterChange);
  }

  componentDidMount () {
    this.findFirstPreviewImage();
    this.subscribeToChanges();
  }

  componentWillUnmount () {
    this.unsubscribeFromChanges();
  }

  handleTextFocus (fieldName) {
    this.setState({previewImageName: fieldName, previewImageType: 'TextField'});
  }

  handleYouTubeLinkFocus (fieldName) {
    this.setState({previewImageName: fieldName, previewImageType: 'YouTubeLink'});
  }

  handleTextBoxFocus (fieldName) {
    this.setState({previewImageName: fieldName, previewImageType: 'TextBox'});
  }

  handleDropDownFocus (fieldName) {
    this.setState({previewImageName: fieldName, previewImageType: 'DropDown'});
  }

  createTextField (name, object) {
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
  }

  createUserImageChooser (name, object) {
    var safeName = name.replace(' ','-');
    if (isEmpty(object.containedImages)) return null;
    return (
      <ImageContainer
        fieldName={ name }
        images={ object.containedImages }
        imageBank={ this.props.imageBank }
        key={`text-field-${safeName}`}
      />
    );
  }

  createYouTubeLink (name, object) {
    var safeName = name.replace(' ','-');
    return (<YouTubeLink
      fieldName={name}
      userText={object.value}
      onTextFieldFocus={this.handleYouTubeLinkFocus}
      key={`you-tube-link-${safeName}`}
    />);
  }

  createTextBox (name, object) {
    var safeName = name.replace(' ','-');
    return (<TextBox
      fieldName={name}
      userText={object.value}
      onTextBoxFocus={this.handleTextBoxFocus}
      key={`text-box-${safeName}`}
    />);
  }

  createColorPicker (name, object) {
    var safeName = name.replace(' ','-');
    return (<ColorPicker
      fieldName={name}
      color={object.value}
      key={`color-picker-${safeName}`}
    />);
  }

  createDropDown (name, object) {
    var safeName = name.replace(' ','-');
    return (<DropDown
      fieldName={ name }
      defaultValue={ object.default }
      value={ object.value }
      options={ object.options }
      onDropDownFocus={ this.handleDropDownFocus }
      key={`drop-down-${safeName}`} />
    );
  }

  findFirstPreviewImage () {
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
  }

  createSection (sectionName, inputArray) {
    var components = [];
    let containers = RenderDataStore.getAllContainers();
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
  }

  render () {
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
          name={ this.state.previewImageName }
          type={ this.state.previewImageType }/>
      </div>
    );
  }
}

export default SpecFields;
