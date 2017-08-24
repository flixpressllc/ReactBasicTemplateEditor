export const YOU_TUBE_API_KEY = 'AIzaSyBxurdcfDBk6hKm3l_vk3MWHGWle47RdMQ';
export const XML_CONTAINER_ID = 'RndTemplate_HF';
export const IMAGES_CONTAINER_ID = 'CroppedImageFilenames';
export const TOP_LEVEL_NAME_TEXT_ONLY = 'OrderRequestOfTextOnlyRndTemplate';
export const TOP_LEVEL_NAME_IMAGES = 'OrderRequestOfFSlidesRndTemplate';

const LOCAL_DEV_THUMBNAIL_PATH = '/images/';
const PRODUCTION_THUMBNAIL_PATH = '/templates/TB/';

export function isDevelopment () {
  return window.location.hostname === 'localhost';
}

function thumbnailPath () {
  if (isDevelopment()) return LOCAL_DEV_THUMBNAIL_PATH;
  return PRODUCTION_THUMBNAIL_PATH;
}

export const THUMBNAIL_URL_PREFIX = thumbnailPath();
