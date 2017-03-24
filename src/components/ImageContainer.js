import React from 'react';
import {SortableContainer, SortableElement, SortableHandle, arrayMove} from 'react-sortable-hoc';
import CaptionInput from './CaptionInput';
import { THUMBNAIL_URL_PREFIX } from '../stores/app-settings';
import { registerDataType } from '../utils/globalContainerConcerns';
import { clone, toType } from 'happy-helpers';
import TemplateSpecificationsStore from '../stores/TemplateSpecificationsStore';
import * as ContainerActions from '../actions/ContainerActions';

import './ImageContainer.scss';

const DATA_TYPE_NAME = 'userImageChooser';

function toRenderString (imageChooserObj) {
  // This won't really be a string. That's okay, though.
  let renderValue = clone(imageChooserObj.containedImages).map((imgObj) => {
    if (imgObj.captions === undefined) {
      imgObj.captions = [];
    }
    if (imageChooserObj.captions === undefined) imageChooserObj.captions = [];
    imgObj.captions = imageChooserObj.captions.map((capLabelOrObj, i) => {
      let label = capLabelOrObj;
      if (toType(capLabelOrObj) === 'object') {
        label = capLabelOrObj.label;
      }
      return {
        label: label,
        value: imgObj.captions[i] || ''
      };
    })
    return imgObj;
  });
  return renderValue;
}

function toDataObject (valueObject, object) {
  // For now, this is a special case taken care of in the App
  return object;
}

registerDataType(DATA_TYPE_NAME, {toRenderString, toDataObject});

const DragHandle = SortableHandle(() => {
  return (
    <div className='reactBasicTemplateEditor-ImageContainer-imageListItemDragHandle'>
      <div/><div/><div/>
    </div>);
});

const ListImage = SortableElement( React.createClass({
  handleChange: function (val, index) {
    this.props.onCaptionChange({
      imageId: this.props.item.id,
      captionIndex: index,
      newValue: val
    });
  },
  handleChangeImage: function () {
    this.props.onChangeImage(this.props.item.id);
  },
  handleRemoveImage: function () {
    this.props.onRemoveImage(this.props.item.id);
  },
  renderCaptions: function () {
    if (this.props.captionsSettings === undefined || this.props.item.captions === undefined) {
      return null;
    }
    const captionValues = clone(this.props.item.captions);
    const captions = this.props.captionsSettings.map((capObj, i) => {
      captionValues[i] = captionValues[i] || '';
      return (
        <CaptionInput
          key={ i }
          type='text'
          settings={ capObj.settings }
          data-index={ i }
          value={ captionValues[i] }
          placeholder={`Optional ${capObj.label}`}
          onChange={ this.handleChange }
          />
      );
    });
    return captions;
  },

  renderButtons: function () {
    let swapButton, removeButton;
    if (toType(this.props.onChangeImage) !== 'function') {
      swapButton = null;
    } else {
      swapButton = (<button
        key={'swap'} className="reactBasicTemplateEditor-ImageContainer-swapImageButton"
        type="button"
        onClick={ this.handleChangeImage }>
        Swap Image
      </button>);
    }

    if (this.props.onRemoveImage) {
      removeButton = (<button
        key={'remove'} className="reactBasicTemplateEditor-ImageContainer-removeImageButton"
        type="button"
        onClick={ this.handleRemoveImage }>
        Remove
      </button>);
    } else {
      removeButton = null;
    }

    if (swapButton || removeButton) {
      return (
        <div className="reactBasicTemplateEditor-ImageContainer-actionButtons">
          {[swapButton, removeButton]}
        </div>
      );
    } else {
      return null;
    }
  },

  render: function () {
    const captions = this.renderCaptions();
    const buttons = this.renderButtons();
    return (
      <div className='reactBasicTemplateEditor-ImageContainer-imageListItem'>
        <img src={ THUMBNAIL_URL_PREFIX + this.props.item.file } />
        <div className='reactBasicTemplateEditor-ImageContainer-imageListItemDataChangers'>
          { buttons }
          { captions }
        </div>
        <DragHandle />
      </div>
    );
  }
}) );

const SortableList = SortableContainer( React.createClass({
  render: function () {
    return (
      <div>
        {this.props.items.map((value, index) =>
          <ListImage
            key={`item-${index}`}
            captionsSettings={ this.props.captionsSettings }
            onCaptionChange={ this.props.onCaptionChange }
            index={index}
            onChangeImage={ this.props.onChangeImage }
            onRemoveImage={ this.props.onRemoveImage }
            item={value} />
        )}
      </div>
    );
  }
}), {transitionDuration: 0} );

const ImageBank = React.createClass({
  render: function () {
    let imageList = this.props.imageBank.map((image, i) => {
      return <img src={ THUMBNAIL_URL_PREFIX + image } key={ i } onClick={ () => { this.props.onChooseImage(image) }}/>;
    });
    return (
      <div className="reactBasicTemplateEditor-ImageContainer-imageBank">
      <h1>  Select a new image </h1>
        { imageList }
      </div>
    );
  }
});

const ImageContainer = React.createClass({
  componentWillMount: function () {
  },

  getImagesStateFromImages: function (images) {
    images = images || [];
    return images.map((val, i) => {
      val.id = i;
      return val;
    });
  },

  getInitialState: function () {
    let imagesState = this.getImagesStateFromImages(this.props.images);
    return {modalIsOpen: false, images: imagesState};
  },

  handleSortEnd: function ({oldIndex, newIndex}) {
    let newArray = arrayMove(this.props.images, oldIndex, newIndex);
    this.updateImages(newArray);
  },

  componentWillReceiveProps: function (newProps) {
    if (newProps.images === this.props.images) return;
    this.setState({images: this.getImagesStateFromImages(newProps.images)});
  },

  handleCaptionChange: function (newCaptionObject) {
    let newArray = this.props.images.map(image => {
      if (image.captions === undefined) {
        // be sure there is an array
        image.captions = [];
      }
      if (image.id === newCaptionObject.imageId) {
        image.captions[newCaptionObject.captionIndex] = newCaptionObject.newValue;
      }
      return image;
    });
    this.updateImages(newArray);
  },

  updateImages: function (newArrayOfImages) {
    ContainerActions.changeContainer(
      DATA_TYPE_NAME,
      this.props.fieldName,
      {containedImages: newArrayOfImages}
    );
  },

  openModal: function () {
    this.setState({modalIsOpen: true})
  },

  closeModal: function () {
    this.setState({modalIsOpen: false})
  },

  handleChangeImage: function (oldImageId) {
    this.setState({imageIdToReplace: oldImageId}, this.openModal)
  },

  handleRemoveImage: function (removeImageId) {
    let newImageArray = clone(this.state.images).filter(image => {
      if (image.id === removeImageId) return false;
      return true;
    });

    this.updateImages(newImageArray);
  },

  handleReplaceImage: function (incomingImage) {
    let outgoingId = this.state.imageIdToReplace;

    let newImageArray = clone(this.state.images).map(image => {
      if (image.id === outgoingId) {
        image.file = incomingImage;
      }
      return image;
    });

    this.updateImages(newImageArray);
    this.closeModal();
  },

  renderFakeModal: function () {
    return (
      <div className="reactBasicTemplateEditor-ImageContainer-modal">

        <ImageBank onChooseImage={ this.handleReplaceImage } imageBank={ this.props.imageBank } />
        <button className="reactBasicTemplateEditor-ImageContainer-modalCancel"
          onClick={ this.closeModal } type="button">
          Cancel
        </button>
      </div>
    );
  },

  deriveCaptionsSettings: function (captionsSettingsArr) {
    if (toType(captionsSettingsArr) !== 'array') return captionsSettingsArr;
    return captionsSettingsArr.map(val => {
      if (toType(val) === 'string') return {label: val};
      if (toType(val) === 'object') return val;
      throw new Error(`The value passed in to the captionsDirective should be an array containing strings or objects, '${toType(val)}' given.`);
    })
  },

  shouldAllowRemove: function () {
    let min = TemplateSpecificationsStore.getSpec('minImages');
    return this.state.images.length > min;
  },

  renderImageList: function () {
    const images = this.state.images;
    const changeImageFunc = (this.props.imageBank.length > 1) ? this.handleChangeImage : null;
    const removeImageFunc = (this.shouldAllowRemove()) ? this.handleRemoveImage : null;
    const captionsSettings = this.deriveCaptionsSettings(this.props.captions)
    return (
      <SortableList
        items={ images }
        onSortEnd={ this.handleSortEnd }
        captionsSettings={ captionsSettings }
        onCaptionChange={ this.handleCaptionChange }
        useDragHandle={ true }
        onChangeImage={ changeImageFunc }
        onRemoveImage={ removeImageFunc }
      />
    );
  },

  render: function () {
    if (this.state.images.length === 0) return null;
    const content = this.state.modalIsOpen ? this.renderFakeModal() : this.renderImageList();
    const explanation = this.state.images.length > 1 ?
      'Change the order of the images by dragging up and down with the handles on the right.':'';
    return (
      <div className="reactBasicTemplateEditor-ImageContainer">
        <div className="reactBasicTemplateEditor-ImageContainer-explainer">
          { explanation }
        </div>
        { content }
      </div>
    );
  }

})

export default ImageContainer;
