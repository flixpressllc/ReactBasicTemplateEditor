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

function getCatSongs(categoryId, username) {
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
    }).fail(function (err) { rej(err) });
  });
}

function getCategoriesAndSongsForUser (username) {
  return new Promise((res, rej) => {
    $.ajax({
      url: CATEGORY_URL,
      dataType: 'xml',
      type: 'GET'
    }).done(function(result){
      var getAllCats = [];
      var categoriesObj = {};
      var categories = nativeXmlToObject(result).ArrayOfCategory.Category.SubCategories.Category;

      $.each(categories, function(arrPos, category){
        var catSongs = getCatSongs(category.Id, username)
        getAllCats.push(catSongs);
        catSongs.then(function(songs){
          categoriesObj[category.Name] = {};
          categoriesObj[category.Name].id = category.Id;
          categoriesObj[category.Name].songs = songs;
        });
      });

      Promise.all(getAllCats).then(function(){
        res(categoriesObj);
      }).catch(function (err) {
        rej(err);
      })
    }).fail(function (err) {
      rej(err);
    });
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
