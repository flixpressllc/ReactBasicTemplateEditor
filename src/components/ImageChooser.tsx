import * as React from 'react';
import { THUMBNAIL_URL_PREFIX } from '../stores/app-settings';
import './ImageChooser.scss';

interface P {
  onChooseImage(imageUrl: string): void,
  imageBank: Array<string>
}

function invokeImageUploader() {
  // nothing for now.
}

const ImageChooser = (props: P) => {
  let imageList = props.imageBank.map((imageUrl, i) => {
    return (<img src={ THUMBNAIL_URL_PREFIX + imageUrl } key={ i } onClick={ () => { props.onChooseImage(imageUrl) }}/>);
  });
  return (
    <div className="reactBasicTemplateEditor-ImageContainer-imageBank">
      <p className="reactBasicTemplateEditor-ImageContainer-imageBankInstructions">
        <button onClick={invokeImageUploader}>Upload a new image</button> or select from below:
      </p>
      { imageList }
    </div>
  );
};

export default ImageChooser
