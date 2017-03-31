function Resize_Box(){
  var x = $('body').width();
  var y = parent.document.body.clientHeight - 75;
  parent.$.fn.colorbox.resize({
    innerWidth: x,
    innerHeight: y
  });
}

$(document).ready(function(){
  if ($('#Template_FlashContent_Div').height > 600)
  {
    Resize_Box();
  }
});
