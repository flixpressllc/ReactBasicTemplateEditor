var styleVars = {
  multiplier: 14
};

var styles = {
  previewImage: {
    border: '1px solid black',
    margin: '1em',
    float: 'left',
    width: (16 * styleVars.multiplier) + 'px',
    height: (9 * styleVars.multiplier) + 'px',
    textAlign: 'center',
    fontSize: (1.6 * styleVars.multiplier) + 'px',
    color: 'white',
    textShadow: '0 0 4px black',
    backgroundSize: 'contain'
  },
  messages: {
    error: {
      color: 'red'
    }
  }
};

// See slide 32 and beyond at https://speakerdeck.com/vjeux/react-css-in-js
var m = function () {
  var res = {};
  for (var i=0; i < arguments.length; ++i) {
    if (arguments[i]) {
      Object.assign(res, arguments[i]);
    }
  }
  return res;
};

export {styles, m};