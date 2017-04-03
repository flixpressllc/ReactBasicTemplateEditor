// These next two fix a problem on Firefox, specifically,
// but the implementation affects all browsers
export function disableTextSelectionOnTheWholeBody () {
  // WARNING: will overwrite any existing inline styles on <body>
  document.body.style = '-moz-user-select: none; user-select: none;';
}

export function enableTextSelectionOnTheWholeBody () {
  // WARNING: will overwrite any existing inline styles on <body>
  document.body.style = '';
}