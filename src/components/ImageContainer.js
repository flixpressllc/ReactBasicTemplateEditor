import React from 'react';
import {SortableContainer, SortableElement, SortableHandle, arrayMove} from 'react-sortable-hoc';
import './ImageContainer.scss';

const DragHandle = SortableHandle(() => {
  return (<span className='reactBasicTemplateEditor-ImageContainer-imageListItemDragHandle'>|||</span>);
});

const ListImage = SortableElement( React.createClass({
  handleChange: function (e) {
    this.props.onCaptionChange(this.props.item.id, e.target.value);
  },
  render: function () {
    return (
      <div className='reactBasicTemplateEditor-ImageContainer-imageListItem'>
        <img src={ this.props.item.url } />
        <div className='reactBasicTemplateEditor-ImageContainer-imageCaption'>
          <label htmlFor='caption'>
            Caption:
          </label>
          <input
            type='text'
            name='caption'
            value={ this.props.item.caption }
            onChange={ this.handleChange }
            />
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
            onCaptionChange={ this.props.onCaptionChange }
            index={index}
            item={value} />
        )}
      </div>
    );
  }
}), {transitionDuration: 0} );

const ImageContainer = React.createClass({
  getInitialState: function () {
    return {modalIsOpen: false};
  },

  handleSortEnd: function ({oldIndex, newIndex}) {
    let newArray = arrayMove(this.props.images, oldIndex, newIndex);
    this.props.onUpdateImages(newArray);
  },

  handlecaptionChange: function (id, newCaptionText) {
    let newArray = this.props.images.map(image => {
      if (image.id === id) {
        image.caption = newCaptionText;
      }
      return image;
    });
    this.props.onUpdateImages(newArray);
  },

  render: function () {
    // let images = ['one','two','three'];
    let images = [].concat(this.props.images);
    if (images.length === 0) return null;
    return (
      <div className="reactBasicTemplateEditor-ImageContainer">
        <SortableList
          items={ images }
          onSortEnd={ this.handleSortEnd }
          onCaptionChange={ this.handlecaptionChange }
          useDragHandle={ true }
        />
      </div>
    );
  }

})

export default ImageContainer;