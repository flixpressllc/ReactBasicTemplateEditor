import React from 'react';
import DraggableList from 'react-draggable-list';
import './ImageContainer.scss';

let ListImage = React.createClass({
  render: function () {
    let {dragHandle, item} = this.props;
    return (
      <div className='reactBasicTemplateEditor-ImageContainer-imageListItem'>
        <img src={ item.url } />
        {dragHandle(<span className='reactBasicTemplateEditor-ImageContainer-imageListItemDragHandle'>|||</span>)}
      </div>
    );
  }
})

var ImageContainer = React.createClass({
  getInitialState: function () {
    return {modalIsOpen: false};
  },

  _onListChange: function (newList) {
    // this.setState({list: newList});
    // testImages = newList;
  },

  render: function () {
    let images = [].concat(this.props.images);
    if (images.length === 0) return null;
    return (
      <div className="reactBasicTemplateEditor-ImageContainer">
        <DraggableList
          itemKey='id'
          template={ ListImage }
          list={ images }
          onMoveEnd={ newList => this.props.onUpdateImages(newList) }
          container={() => document.body}
        />
      </div>
    );
  }

})

export default ImageContainer;
