import React from 'react';
import { THUMBNAIL_URL_PREFIX } from '../stores/app-settings';
import './ImageChooser.scss';

const ImageChooser = (props) => {
  let imageList = props.imageBank.map((imageUrl, i) => {
    return (<img src={ THUMBNAIL_URL_PREFIX + imageUrl } key={ i } onClick={ () => { props.onChooseImage(imageUrl) }}/>);
  });
  return (
    <div className="reactBasicTemplateEditor-ImageContainer-imageBank">
      <p className="reactBasicTemplateEditor-ImageContainer-imageBankInstructions">
        <button>Upload a new image</button> or select from below:
      </p>
      { imageList }
    </div>
  );
};

export default ImageChooser
