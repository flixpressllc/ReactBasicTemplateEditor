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

export {m};
