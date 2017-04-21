import {nativeXmlToObject} from './xmlAdapter';

// https://ws.flixpress.com/AudioWebService.asmx/GetAudio?categoryId=2&page=1&pageSize=100&username=bowdo

// https://ws.flixpress.com/AudioWebService.asmx/GetCategoryTree

const CATEGORY_URL = 'https://ws.flixpress.com/AudioWebService.asmx/GetCategoryTree';
const CUSTOM_URL = 'https://ws.flixpress.com/CustomAudioWebService.asmx/GetCustomAudio';
const AUDIO_URL = 'https://ws.flixpress.com/AudioWebService.asmx/GetAudio';

export function _createCategoriesObjForUser (categories, username) {
  return new Promise((res,rej) => {
    var categoriesObj = {};

    Promise.all(
      categories.map(category => {
        return _getSongsFromCategoryForUser(category.Id, username)
        .then(songs => {
          categoriesObj[category.Name] = {};
          categoriesObj[category.Name].id = category.Id;
          categoriesObj[category.Name].songs = songs;
        }).catch(err => rej(err));
      })
    ).then(() => {
      res(categoriesObj);
    }).catch(err => rej(err));
  }).catch(err => {throw err});
}

export function _getSongsFromCategoryForUser(categoryId, username) {
  return new Promise((res, rej) => {
    $.ajax({
      url: AUDIO_URL,
      data: {username: username, categoryId: categoryId, page:1, pageSize: 1000},
      dataType: 'xml',
      type: 'GET'
    }).done(result => {
      let songs = nativeXmlToObject(result).ResultSetOfAudio.Records.Audio;
      res(songs);
    }).fail(err => rej(err));
  }).catch(err => {throw err});
}

export function _getCustomSongsForUser (username) {
  return new Promise((res, rej) => {
    $.ajax({
      url: CUSTOM_URL,
      dataType: 'xml',
      type: 'GET',
      data: {username: username, page:1, pageSize: 1000}
    }).done(result => {
      var songs = nativeXmlToObject(result).ResultSetOfCustomAudio.Records.CustomAudio;
      songs = songs === undefined ? [] : songs;
      res(songs);
    }).fail(err => rej(err));
  }).catch(err => {throw err});
}

export function _getAllAvailableCategories () {
  return new Promise((res, rej) => {
    $.ajax({
      url: CATEGORY_URL,
      dataType: 'xml',
      type: 'GET'
    }).done(result => {
      res(nativeXmlToObject(result).ArrayOfCategory.Category.SubCategories.Category);
    }).fail(err => rej(err));
  }).catch(err => {throw err});
}

export function _getCategoriesAndSongsForUser (username) {
  return new Promise((res, rej) => {
    _getAllAvailableCategories()
    .then(categories => _createCategoriesObjForUser(categories, username))
    .then(categoriesObj => res(categoriesObj))
    .catch(err => rej(err));
  }).catch(err => {throw err});
}

export default function getAudioOptions (username) {
  var everythingIsReady = $.Deferred();

  Promise.all([
    _getCategoriesAndSongsForUser(username),
    _getCustomSongsForUser(username)
  ])
  .then(([categories, customAudio]) => {
    everythingIsReady.resolve({categories, customAudio});
  })
  .catch(err => everythingIsReady.reject(err));

  return everythingIsReady;
}
