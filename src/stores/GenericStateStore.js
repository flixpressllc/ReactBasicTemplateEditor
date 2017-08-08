import { clone, traverseObject, toType } from 'happy-helpers';

/*
Allowed states will look something like this:

  allowedStates = {
    templateType: 'string',
    templateId: 'number',
    caughtErrors: 'array'
  }

  Starting values will look something like this:

    allowedStates = {
      templateType: '',
      caughtErrors: []
    }
*/

class GenericStateStore {
  constructor (allowedStates, startingValues) {
    this._setupAllowedStates(allowedStates);
    this._setupStartingValues(startingValues);
  }

  _setupAllowedStates (allowedStates) {
    if (toType(allowedStates) !== 'object') {
      throw new Error(`A generic state store cannot be instanciated without an 'allowedStates' object. ${allowedStates} given.`)
    }
    this.allowedStates = allowedStates;
  }

  _setupStartingValues (startingValues) {
    if (startingValues) {
      this.storedState = startingValues;
    }
  }

  getState (stringOrArrayOfKeys) {
    if (stringOrArrayOfKeys === undefined) return clone(this.storedState);
    if (toType(stringOrArrayOfKeys) === 'array') {
      return this._getStateByArrayOfKeys(stringOrArrayOfKeys);
    }
    if (toType(stringOrArrayOfKeys) === 'string') {
      return this._getStateByKey(stringOrArrayOfKeys);
    }
  }

  // Returns a value only
  _getStateByKey (key) {
    if (this.allowedStates[key] === undefined) {
      throw new Error(`The desired state property "${key}" from StateStore is not allowed.`);
    }
    if (['object', 'array'].indexOf(this.allowedStates[key]) > -1) {
      return clone(this.storedState[key]);
    }
    return this.storedState[key];
  }

  // Returns an object of key: value pairs
  _getStateByArrayOfKeys (arrayOfKeys) {
    let objects = arrayOfKeys.map(key => {
      return {[key]: this.getStateByKey(key)} // ES2015 computed property names
    });
    return Object.assign(...objects);
  }

  setState (obj) {
    this._storedStatesAreAllowed(obj);
    let newState = Object.assign({}, this.storedState, obj);
    if (!this._storedStatesAreEqual(newState)) {
      this.storedState = newState;
      return true;
    }
    return false;
  }

  _storedStatesAreAllowed (obj) {
    traverseObject(obj, (k, v) => {
      if (this.allowedStates[k] === undefined) {
        throw new Error(`There is no entry for "${k}" in allowed states.`);
      }
      if (this.allowedStates[k] !== toType(v)) {
        throw new Error(`Expected the type of ${k} to be ${this.allowedStates[k]}. ${toType(v)} was given.`)
      }
    })
  }

  _storedStateExists (key) {
    return this.storedState[key] !== undefined;
  }

  _storedStateValueEquals (key, newValue) {
    if (!this._storedStateExists(key)) return false;
    let stateValue = this.storedState[key];
    let theType = toType(stateValue);

    if (theType !== toType(newValue)) return false;
    if (['array','object'].indexOf(theType) > -1) {
      return JSON.stringify(newValue) === JSON.stringify(stateValue);
    }
    return newValue === stateValue;
  }

  _storedStatesAreEqual (newState) {
    let equal = true;
    traverseObject(newState, (k, v) => {
      if (!this._storedStateValueEquals(k, v)) {
        equal = false;
      }
    })
    return equal;
  }
}

export default GenericStateStore;
