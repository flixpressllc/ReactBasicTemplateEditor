import React from 'react';
import Modal from 'react-modal';
import {CONTAINING_ELEMENT_ID} from '../config/unavoidable-constants';
import './ImageContainer.scss';

let testImages = [
  'something.jpg',
  'somethingelse.jpg'
];

var ImageContainer = React.createClass({
  getInitialState: function () {
    return {modalIsOpen: false};
  },
  
  renderImageListItems: function () {
    let images = testImages;
    // let images = this.props.images;
    
    return images.map( (imgName, i) => {
      return <li key={i}>{ imgName }</li>;
    })
  },
  
  render: function () {
    let images = this.renderImageListItems();
    if (images.length === 0) return null;
    return (
      <div className="reactBasicTemplateEditor-ImageContainer">
        <ul>
          { images }
        </ul>
        
      </div>
    );
  }

})

export default ImageContainer;
