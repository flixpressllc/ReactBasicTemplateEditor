function parentColorboxExists () {
  return window.parent.$ && window.parent.$.colorbox;
}

function shouldResize () {
  const defaultInnerCboxHeightInParent = 598;
  const thisEditorHeightNow = document.body.clientHeight;
  return thisEditorHeightNow > defaultInnerCboxHeightInParent;
}

function makeColorboxFullHeight(){
  const extraHeightOnColorboxChrome = 75;
  const viewportHeight = parent.document.body.clientHeight;
  const desiredHeight = viewportHeight - extraHeightOnColorboxChrome;

  parent.$.fn.colorbox.resize({
    innerHeight: desiredHeight
  });
}

export function adjustColorbox () {
  if ( parentColorboxExists() && shouldResize() ) {
    makeColorboxFullHeight();
  }
}
