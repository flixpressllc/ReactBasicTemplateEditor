import dispatcher from './dispatcher';
import RenderDataStore from '../stores/RenderDataStore';

export function addImageToBank(imageUrl: string) {
  addImagesToBank([imageUrl]);
}

export function addImagesToBank(images: Array<string>) {
  let imageBank = RenderDataStore.getTemplateOptions('imageBank');
  imageBank = imageBank.concat(images);
  dispatcher.dispatch({type: 'SET_OPTIONS', templateOptions: {imageBank}});
}
