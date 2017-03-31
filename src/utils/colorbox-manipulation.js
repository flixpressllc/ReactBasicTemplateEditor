import { nestedPropertyExists } from 'happy-helpers';

export function makeColorboxFullHeight(){
  if (! nestedPropertyExists(parent, '$.fn.colorbox')) {
    return;
  }
  var desiredHeight = parent.document.body.clientHeight - 75;

  parent.$.fn.colorbox.resize({
    innerHeight: desiredHeight
  });
}
//
// $(document).ready(function(){
//   if ($('#Template_FlashContent_Div').height > 600)
//   {
//     Resize_Box();
//   }
// });
