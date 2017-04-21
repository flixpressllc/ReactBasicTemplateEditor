import {nativeXmlToObject} from './xmlAdapter';

// https://ws.flixpress.com/AudioWebService.asmx/GetAudio?categoryId=2&page=1&pageSize=100&username=bowdo

// https://ws.flixpress.com/AudioWebService.asmx/GetCategoryTree

const CATEGORY_URL = 'https://ws.flixpress.com/AudioWebService.asmx/GetCategoryTree';
const CUSTOM_URL = 'https://ws.flixpress.com/CustomAudioWebService.asmx/GetCustomAudio';
const AUDIO_URL = 'https://ws.flixpress.com/AudioWebService.asmx/GetAudio';

function whenAll(arrayOfPromises) {
  return $.when.apply($, arrayOfPromises).then(function() {
    return Array.prototype.slice.call(arguments, 0);
  });
}

function createCategoriesObjForUser (categories, username) {
  return new Promise((res,rej) => {
    var getAllCats = [];
    var categoriesObj = {};

    $.each(categories, function(arrPos, category){
      var catSongs = getSongsFromCategoryForUser(category.Id, username)
      catSongs.then(function(songs){
        categoriesObj[category.Name] = {};
        categoriesObj[category.Name].id = category.Id;
        categoriesObj[category.Name].songs = songs;
      });
      getAllCats.push(catSongs);
    });

    Promise.all(getAllCats).then(function(){
      res(categoriesObj);
    }).catch(err => rej(err));
  });
}

function getSongsFromCategoryForUser(categoryId, username) {
  return new Promise((res, rej) => {
    $.ajax({
      url: AUDIO_URL,
      data: {username: username, categoryId: categoryId, page:1, pageSize: 1000},
      dataType: 'xml',
      type: 'GET'
    }).done(function (result) {
      let songs = nativeXmlToObject(result).ResultSetOfAudio.Records.Audio;
      res(songs);
    }).fail(err => rej(err));
  });
}

function getCustomSongsForUser (username) {
  return new Promise((res, rej) => {
    $.ajax({
      url: CUSTOM_URL,
      dataType: 'xml',
      type: 'GET',
      data: {username: username, page:1, pageSize: 1000}
    }).done(function (result) {
      var songs = nativeXmlToObject(result).ResultSetOfCustomAudio.Records.CustomAudio;
      songs = songs === undefined ? [] : songs;
      res(songs);
    }).fail(err => rej(err));
  });
}

function getCategoriesForUser (username) {
  return new Promise((res, rej) => {
    $.ajax({
      url: CATEGORY_URL,
      dataType: 'xml',
      type: 'GET'
    }).done(function(result){
      res(nativeXmlToObject(result).ArrayOfCategory.Category.SubCategories.Category);
    }).fail(err => rej(err));
  });
}

function getCategoriesAndSongsForUser (username) {
  return new Promise((res, rej) => {
    getCategoriesForUser(username)
    .then(categories => createCategoriesObjForUser(categories, username))
    .then(categoriesObj => res(categoriesObj))
    .catch(err => rej(err));
  });
}

export default function getAudioOptions (username) {
  var everythingIsReady = $.Deferred();

  var haveAllCats = $.Deferred();
  var haveAllCustom = $.Deferred();

  getCategoriesAndSongsForUser(username).done(catsObj => {
    haveAllCats.resolve(catsObj)
  })

  getCustomSongsForUser(username).then(songs => {
    haveAllCustom.resolve(songs);
  })

  $.when(haveAllCats, haveAllCustom).then(function (categories, customAudio) {
    everythingIsReady.resolve({categories, customAudio});
  });

  return everythingIsReady;
}
