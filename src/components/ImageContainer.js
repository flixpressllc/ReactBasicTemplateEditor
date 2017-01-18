import React from 'react';
import DraggableList from 'react-draggable-list';
import './ImageContainer.scss';

let ListImage = React.createClass({
  shouldComponentUpdate: function (newProps) {
    let shouldUpdate = false;
    ['id','caption','url'].map((property) => {
      if (newProps.item[property] !== this.props.item[property]){
        shouldUpdate = true;
      }
    });
    return shouldUpdate;
  },

  handleChange: function (e) {
    // not working...
  },

  render: function () {
    let {dragHandle, item} = this.props;
    return (
      <div className='reactBasicTemplateEditor-ImageContainer-imageListItem'>
        <img src={ item.url } />
        <div className='reactBasicTemplateEditor-ImageContainer-imageCaption'>
          <label htmlFor='caption'>
            Caption:
          </label>
          <input
            type='text'
            name='caption'
            value={ item.caption }
            onChange={ this.handleChange }
            />
        </div>

        {dragHandle(<span className='reactBasicTemplateEditor-ImageContainer-imageListItemDragHandle'>|||</span>)}
      </div>
    );
  }
})

let ImageContainer = React.createClass({
  getInitialState: function () {
    return {modalIsOpen: false};
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
          onMoveEnd={ this.props.onUpdateImages }
          container={() => document.body}
        />
      </div>
    );
  }

})

export default ImageContainer;
