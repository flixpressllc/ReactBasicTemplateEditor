import React from 'react';
import {SortableContainer, SortableElement, SortableHandle, arrayMove} from 'react-sortable-hoc';
import CaptionInput from './CaptionInput';
import Modal from './lib/Modal';
import { THUMBNAIL_URL_PREFIX } from '../stores/app-settings';
import { registerDataType } from '../utils/globalContainerConcerns';
import { clone, toType } from 'happy-helpers';
import TemplateSpecificationsStore from '../stores/TemplateSpecificationsStore';
import { disableTextSelectionOnTheWholeBody, enableTextSelectionOnTheWholeBody } from '../utils/browser-specific-hacks';
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

const SortableUserImage = SortableElement( class UserImage extends React.Component {
  constructor (props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeImage = this.handleChangeImage.bind(this);
    this.handleRemoveImage = this.handleRemoveImage.bind(this);
  }
  handleChange (val, index) {
    this.props.onCaptionChange({
      imageId: this.props.item.id,
      captionIndex: index,
      newValue: val
    });
  }

  handleChangeImage () {
    this.props.onChangeImage(this.props.item.id);
  }

  handleRemoveImage () {
    this.props.onRemoveImage(this.props.item.id);
  }

  renderCaptions () {
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
          placeholder={ capObj.label }
          onChange={ this.handleChange }
          />
      );
    });
    return captions;
  }

  renderButtons () {
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
  }

  render () {
    const captions = this.renderCaptions();
    const buttons = this.renderButtons();
    return (
      <div className='reactBasicTemplateEditor-ImageContainer-imageListItem'>
        <div className='reactBasicTemplateEditor-ImageContainer-imageListItemData'>
          <img src={ THUMBNAIL_URL_PREFIX + this.props.item.file } />
          <div className='reactBasicTemplateEditor-ImageContainer-imageListItemDataChangers'>
            { buttons }
            { captions }
          </div>
        </div>
        <DragHandle />
      </div>
    );
  }
});

const SortableListOfImages = SortableContainer( function ListOfImages (props) {
  return (
    <div>
      {props.items.map((value, index) =>
        <SortableUserImage
          key={`item-${index}`}
          captionsSettings={ props.captionsSettings }
          onCaptionChange={ props.onCaptionChange }
          index={index}
          onChangeImage={ props.onChangeImage }
          onRemoveImage={ props.onRemoveImage }
          item={value} />
      )}
    </div>
  );
}, {transitionDuration: 0} );

const ImageSelection = (props) => {
  let imageList = props.imageBank.map((image, i) => {
    return <img src={ THUMBNAIL_URL_PREFIX + image } key={ i } onClick={ () => { props.onChooseImage(image) }}/>;
  });
  return (
    <div className="reactBasicTemplateEditor-ImageContainer-imageBank">
      <p className="reactBasicTemplateEditor-ImageContainer-imageBankInstructions">Select a new image</p>
      { imageList }
    </div>
  );
};

class ImageContainer extends React.Component {
  constructor (props) {
    super(props);
    let imagesState = this.getImagesStateFromImages(this.props.images);
    this.state = {modalIsOpen: false, images: imagesState};

    this.handleSortEnd = this.handleSortEnd.bind(this);
    this.handleSortStart = this.handleSortStart.bind(this);
    this.handleCaptionChange = this.handleCaptionChange.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleChangeImage = this.handleChangeImage.bind(this);
    this.handleRemoveImage = this.handleRemoveImage.bind(this);
    this.handleAddImage = this.handleAddImage.bind(this);
    this.handleReplaceImage = this.handleReplaceImage.bind(this);

  }

  getImagesStateFromImages (images) {
    images = images || [];
    return images.map((val, i) => {
      val.id = i;
      return val;
    });
  }

  handleSortEnd ({oldIndex, newIndex}) {
    let newArray = arrayMove(this.props.images, oldIndex, newIndex);
    this.updateImages(newArray);
    enableTextSelectionOnTheWholeBody();
  }

  handleSortStart () {
    disableTextSelectionOnTheWholeBody();
  }

  componentWillReceiveProps (newProps) {
    if (newProps.images === this.props.images) return;
    this.setState({images: this.getImagesStateFromImages(newProps.images)});
  }

  handleCaptionChange (newCaptionObject) {
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
  }

  updateImages (newArrayOfImages) {
    ContainerActions.changeContainer(
      DATA_TYPE_NAME,
      this.props.fieldName,
      {containedImages: newArrayOfImages}
    );
  }

  openModal () {
    this.setState({modalIsOpen: true})
  }

  handleCloseModal () {
    this.setState({modalIsOpen: false})
  }

  handleChangeImage (oldImageId) {
    this.setState({imageIdToReplace: oldImageId}, this.openModal)
  }

  handleRemoveImage (removeImageId) {
    let newImageArray = clone(this.state.images).filter(image => {
      if (image.id === removeImageId) return false;
      return true;
    });

    this.updateImages(newImageArray);
  }

  wipeCaptions (imageObj) {
    if (imageObj.captions) {
      imageObj.captions = imageObj.captions.map(()=>'');
    }
    return imageObj;
  }

  handleAddImage () {
    let newImageArray = this.state.images.concat(
      this.wipeCaptions(clone(this.state.images[0]))
    )
    this.updateImages(newImageArray);
  }

  handleReplaceImage (incomingImage) {
    let outgoingId = this.state.imageIdToReplace;

    let newImageArray = clone(this.state.images).map(image => {
      if (image.id === outgoingId) {
        image.file = incomingImage;
      }
      return image;
    });

    this.updateImages(newImageArray);
    this.handleCloseModal();
  }

  deriveCaptionsSettings (captionsSettingsArr) {
    if (toType(captionsSettingsArr) !== 'array') return captionsSettingsArr;
    return captionsSettingsArr.map(val => {
      if (toType(val) === 'string') return {label: val};
      if (toType(val) === 'object') return val;
      throw new Error(`The value passed in to the captionsDirective should be an array containing strings or objects, '${toType(val)}' given.`);
    })
  }

  shouldAllowRemove () {
    let min = TemplateSpecificationsStore.getSpec('minImages');
    return this.state.images.length > min;
  }

  shouldAllowAdd () {
    let max = TemplateSpecificationsStore.getSpec('maxImages');
    return this.state.images.length < max;
  }

  renderImageList () {
    const images = this.state.images;
    const changeImageFunc = (this.props.imageBank.length > 1) ? this.handleChangeImage : null;
    const removeImageFunc = (this.shouldAllowRemove()) ? this.handleRemoveImage : null;
    const captionsSettings = this.deriveCaptionsSettings(this.props.captions)
    return (
      <SortableListOfImages
        items={ images }
        onSortEnd={ this.handleSortEnd }
        captionsSettings={ captionsSettings }
        onCaptionChange={ this.handleCaptionChange }
        useDragHandle={ true }
        onChangeImage={ changeImageFunc }
        onRemoveImage={ removeImageFunc }
        onSortStart={ this.handleSortStart }
      />
    );
  }

  render () {
    if (this.state.images.length === 0) return null;
    const imageList = this.renderImageList();
    const explanation = this.state.images.length > 1 ?
      'Change the order of the images by dragging up and down with the handles on the right.':'';
    return (
      <div className="reactBasicTemplateEditor-ImageContainer">
        <div className="reactBasicTemplateEditor-ImageContainer-explainer">
          { explanation }
        </div>
        { imageList }
        {this.shouldAllowAdd() ? (<button
          className="reactBasicTemplateEditor-ImageContainer-addImageButton"
          type="button"
          onClick={this.handleAddImage}>
          Add Image
        </button>): null}

        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.handleCloseModal}
          contentLabel="Choose a replacement image">

          <ImageSelection onChooseImage={ this.handleReplaceImage } imageBank={ this.props.imageBank } />
          <button className="reactBasicTemplateEditor-ImageContainer-modalCancel"
            onClick={ this.handleCloseModal } type="button">
            Cancel
          </button>
        </Modal>
      </div>
    );
  }

}

export default ImageContainer;
