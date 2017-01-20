export function round(value, decimals) {
    decimals = decimals === undefined ? 2 : decimals;
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function isEmpty (obj) {
  if (!obj) { return true }
  return (Object.getOwnPropertyNames(obj).length === 0);
}

export function isObject(x) {
  if (x === null) { return false; }
  return ( typeof x === 'object' );
}

// Traverses an object.
// callback should return an array with a key, then a value if constructing a
// new object is desired.
export function traverseObject (obj, callback, recursive = false, preserveOriginal = true) {
  let newObject = preserveOriginal ? clone(obj) : obj;
  let returnedObj = {};
  for (let key in newObject) {
    if (newObject.hasOwnProperty(key) === false) continue;
    if ( isObject(newObject[key]) && recursive ) {
      let argsMinusFirst = [...arguments].slice(1);
      let recursedObject = traverseObject.apply(this, [newObject[key], ...argsMinusFirst]);
      if (!isEmpty(recursedObject)) {
        newObject[key] = recursedObject;
      }
    }
    let keyValArray = callback(key, newObject[key]);
    if (Array.isArray(keyValArray) && keyValArray.length > 1) {
      returnedObj[keyValArray[0]] = keyValArray[1];
    }
  }
  return returnedObj;
}

export function changePropsInitialCase (obj, whichCase) {
  var makeAspVersion = (whichCase === 'UpperFirst') ? true : false ;
  var newObject = clone(obj);
  if (makeAspVersion) {
    var regex = /[a-z]/;
  } else {
    var regex = /[A-z]/;
  }
  for (var key in newObject) {
    if (newObject.hasOwnProperty(key) === false) continue;
    if (typeof key !== 'string') continue;
    if (key.charAt(0).match(regex) === null) continue;

    var prop = newObject[key];
    var newName = '';
    if (makeAspVersion){
      newName = key.charAt(0).toUpperCase() + key.slice(1);
    } else {
      newName = key.charAt(0).toLowerCase() + key.slice(1);
    }
    delete newObject[key];
    newObject[newName] = prop;
  }
  return newObject;
}

