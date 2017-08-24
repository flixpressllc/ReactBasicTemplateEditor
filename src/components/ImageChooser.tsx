import * as React from 'react';
import ImageUploadButton from './ImageUploadButton';
import { THUMBNAIL_URL_PREFIX } from '../stores/app-settings';
import { uploadImageToServerAndGetNewName } from '../utils/ajax';
import * as ImageBankActions from '../actions/ImageBankActions';
import './ImageChooser.scss';

interface P {
  onChooseImage(imageUrl: string): void,
  imageBank: Array<string>
}

const ImageChooser = (props: P) => {
  let imageList = props.imageBank.map((imageUrl, i) => {
    return (<img src={ THUMBNAIL_URL_PREFIX + imageUrl } key={ i } onClick={ () => { props.onChooseImage(imageUrl) }}/>);
  });
  const uploadFunction = (img: File) => {
    return uploadImageToServerAndGetNewName(img).then(newName => {
      ImageBankActions.addImagesToBank([newName])
      props.onChooseImage(newName)
      return newName;
    });
  }
  return (
    <div className="reactBasicTemplateEditor-ImageContainer-imageBank">
      <p className="reactBasicTemplateEditor-ImageContainer-imageBankInstructions">
        <ImageUploadButton
          uploadFunction={ uploadFunction }
          >
          Upload a new image
        </ImageUploadButton> or select from below:
      </p>
      { imageList }
    </div>
  );
};

export default ImageChooser
