import '../../cfg/polyfills';
export default function MyDeferred () {
    var _resolve,
        _reject,
        capturedPromise = new Promise(function(resolve, reject){
            _resolve = resolve;
            _reject  = reject;
        });

    return {
        'resolve' : _resolve,
        'reject'  : _reject,
        'then'    : function() { capturedPromise.then.apply(capturedPromise, arguments); },
        'done'    : function() { capturedPromise.then.apply(capturedPromise, arguments); },
        'catch'   : function() { capturedPromise.catch.apply(capturedPromise, arguments); },
        'fail'   : function() { capturedPromise.catch.apply(capturedPromise, arguments); }
    }
};
