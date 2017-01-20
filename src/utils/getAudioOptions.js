import jxon from './xmlAdapter';

var getCatSongs = function (categoryId, username) {
  var audioUrl = 'https://ws.flixpress.com/AudioWebService.asmx/GetAudio';
  return $.ajax({
    url: audioUrl,
    data: {username: username, categoryId: categoryId, page:1, pageSize: 1000},
    dataType: 'xml',
    type: 'GET'
  });

}

export default function getAudioOptions (username) {
  var optionsPromise = $.Deferred();
  // https://ws.flixpress.com/AudioWebService.asmx/GetAudio?categoryId=2&page=1&pageSize=100&username=bowdo

  // https://ws.flixpress.com/AudioWebService.asmx/GetCategoryTree

  var categoryUrl = 'https://ws.flixpress.com/AudioWebService.asmx/GetCategoryTree';
  var customUrl = 'https://ws.flixpress.com/CustomAudioWebService.asmx/GetCustomAudio';

  function whenAll(arrayOfPromises) {
    return $.when.apply($, arrayOfPromises).then(function() {
      return Array.prototype.slice.call(arguments, 0);
    });
  }

  var categoriesObj = {};
  var customAudioArr = [];
  var haveAllCats = $.Deferred();
  var haveAllCustom = $.Deferred();

  var getCats = $.ajax({
    url: categoryUrl,
    dataType: 'xml',
    type: 'GET'
  });

  getCats.done(function(result){
    var getAllCats = [];
    var categories = jxon.xmlToJs(result).ArrayOfCategory.Category.SubCategories.Category;

    $.each(categories, function(arrPos, category){
      var catSongs = getCatSongs(category.Id, username)
      getAllCats.push(catSongs);
      catSongs.done(function(result){
        categoriesObj[category.Name] = {};
        categoriesObj[category.Name].id = category.Id;
        categoriesObj[category.Name].songs = jxon.xmlToJs(result).ResultSetOfAudio.Records.Audio;
      });
    });

    whenAll(getAllCats).done(function(){
      haveAllCats.resolve();
    })
  });

  var getCustom = $.ajax({
    url: customUrl,
    dataType: 'xml',
    type: 'GET',
    data: {username: username, page:1, pageSize: 1000}
  });

  getCustom.done(function (result) {
    var songs = jxon.xmlToJs(result).ResultSetOfCustomAudio.Records.CustomAudio;
    for (var i = 0; i < songs.length; i++) {
      customAudioArr.push(songs[i]);
    }
    haveAllCustom.resolve();
  });

  $.when(haveAllCats, haveAllCustom).then(function () {
    optionsPromise.resolve({categories:categoriesObj, customAudio: customAudioArr});
  });

  return optionsPromise;
};

