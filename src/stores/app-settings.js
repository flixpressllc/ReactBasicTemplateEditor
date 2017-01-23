export const YOU_TUBE_API_KEY = 'AIzaSyBxurdcfDBk6hKm3l_vk3MWHGWle47RdMQ';
export const XML_CONTAINER_ID = 'RndTemplate_HF';
export const IMAGES_CONTAINER_ID = 'CroppedImageFilenames';

const LOCAL_DEV_THUMBNAIL_PATH = '/images/';
const PRODUCTION_THUMBNAIL_PATH = '/templates/TB/';

function thumbnailPath () {
  if (window.location.hostname === 'localhost') return LOCAL_DEV_THUMBNAIL_PATH;
  return PRODUCTION_THUMBNAIL_PATH;
}

export const THUMBNAIL_URL_PREFIX = thumbnailPath();
