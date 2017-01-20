import '../../cfg/polyfills';
export default function MyDeferred () {
  var _resolve,
  _reject,
  capturedPromise = new Promise(function(resolve, reject){
    _resolve = resolve;
    _reject  = reject;
  });

  var returnObj = {
    'resolve' : _resolve,
    'reject'  : _reject,
    'then'    : function() { capturedPromise.then.apply(capturedPromise, arguments); return returnObj; },
    'done'    : function() { capturedPromise.then.apply(capturedPromise, arguments); return returnObj; },
    'catch'   : function() { capturedPromise.catch.apply(capturedPromise, arguments); return returnObj; },
    'fail'    : function() { capturedPromise.catch.apply(capturedPromise, arguments); return returnObj; }
  };
  return returnObj;
};
