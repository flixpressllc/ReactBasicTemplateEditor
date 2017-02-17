import React from 'react';
import {SortableContainer, SortableElement, SortableHandle, arrayMove} from 'react-sortable-hoc';
import { THUMBNAIL_URL_PREFIX } from '../stores/app-settings';
import { registerDataType } from '../utils/globalContainerConcerns';
import { clone, toType } from '../utils/helper-functions';
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
    imgObj.captions = imageChooserObj.captions.map((capLabel, i) => {
      return {
        label: capLabel,
        value: imgObj.captions[i] || ''
      };
    })
    return imgObj;
  });
  return renderValue;
}

function toDataObject (object) {
  // For now, this is a special case taken care of in the EditorUserInterface
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
  handleChange: function (e) {
    this.props.onCaptionChange({
      imageId: this.props.item.id,
      captionIndex: e.target.getAttribute('data-index'),
      newValue: e.target.value
    });
  },
  handleChangeImage: function () {
    this.props.onChangeImage(this.props.item.id);
  },
  renderCaptions: function () {
    if (this.props.captions === undefined || this.props.item.captions === undefined) {
      return null;
    }
    const captionValues = clone(this.props.item.captions);
    const captions = this.props.captions.map((capName, i) => {
      captionValues[i] = captionValues[i] || '';
      return (
        <input className='reactBasicTemplateEditor-ImageContainer-imageCaption'
          key={ i }
          type='text'
          data-index={ i }
          name={ capName }
          value={ captionValues[i] }
          placeholder={`Optional ${capName}`}
          onChange={ this.handleChange }
          />
      );
    });
    return captions;
  },

  renderChangeImageButton: function () {

    if (toType(this.props.onChangeImage) !== 'function') { return null; }
    return (<button className="reactBasicTemplateEditor-ImageContainer-imageListItemChangeButton"
      type="button"
      onClick={ this.handleChangeImage }>
      Change Image
    </button>);

  },

  render: function () {
    const captions = this.renderCaptions();
    const button = this.renderChangeImageButton();
    return (
      <div className='reactBasicTemplateEditor-ImageContainer-imageListItem'>
        <img src={ THUMBNAIL_URL_PREFIX + this.props.item.file } />
        <div className='reactBasicTemplateEditor-ImageContainer-imageListItemDataChangers'>
          { button }
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
            captions={ this.props.captions }
            onCaptionChange={ this.props.onCaptionChange }
            index={index}
            onChangeImage={ this.props.onChangeImage }
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
    //something
    this.setState({imageIdToReplace: oldImageId}, this.openModal)
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
        <button className="reactBasicTemplateEditor-ImageContainer-modalCancel"
          onClick={ this.closeModal } type="button">
          Cancel</button>

        <ImageBank onChooseImage={ this.handleReplaceImage } imageBank={ this.props.imageBank } />
      </div>
    );
  },

  renderImageList: function () {
    const images = this.state.images;
    const changeImageFunc = (this.props.imageBank.length > 1) ? this.handleChangeImage : null;
    return (
      <SortableList
        items={ images }
        onSortEnd={ this.handleSortEnd }
        captions={ this.props.captions }
        onCaptionChange={ this.handleCaptionChange }
        useDragHandle={ true }
        onChangeImage={ changeImageFunc }
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
