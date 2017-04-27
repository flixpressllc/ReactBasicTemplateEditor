import { xmlStringToObject } from './xmlAdapter';
import { forceArray } from 'happy-helpers';
import { fetch as ffetch, fetchWithParams } from './ajax';

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
    const dataToSend = {
      username: username,
      categoryId: categoryId,
      page: 1,
      pageSize: 1000
    };
    fetchWithParams(AUDIO_URL, dataToSend).then(response => response.text()).then(result => {
      let songs = xmlStringToObject(result).ResultSetOfAudio.Records.Audio;
      res(forceArray(songs));
    }).catch(err => rej(err));
  }).catch(err => {throw err});
}

export function _getCustomSongsForUser (username) {
  return new Promise((res, rej) => {
    const dataToSend = {
      username: username,
      page: 1,
      pageSize: 1000
    };
    fetchWithParams(CUSTOM_URL, dataToSend).then(response => response.text()).then(result => {
      var songs = xmlStringToObject(result).ResultSetOfCustomAudio.Records.CustomAudio;
      res(forceArray(songs));
    }).catch(err => rej(err));
  }).catch(err => {throw err});
}

export function _getAllAvailableCategories () {
  return new Promise((res, rej) => {
    ffetch(CATEGORY_URL).then(response => response.text()).then(result => {
      res(xmlStringToObject(result).ArrayOfCategory.Category.SubCategories.Category);
    }).catch(err => rej(err));
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

export default function getAudioOptions (username) { return new Promise( (resolve, reject) => {
  Promise.all([
    _getCategoriesAndSongsForUser(username),
    _getCustomSongsForUser(username)
  ])
  .then(([categories, customAudio]) => {
    resolve({categories, customAudio});
  })
  .catch(err => reject(err));
})}
