import { EventEmitter } from 'events';
import dispatcher from '../actions/dispatcher';
import { clone, traverseObject, toType } from 'happy-helpers';
import { isDevelopment } from './app-settings';

const ALLOWED_STATES = {
  templateType: 'string',
  templateId: 'number',
  caughtErrors: 'array',
  username: 'string',
  usernames: 'string'
}

class StateStore extends EventEmitter {
  constructor () {
    super();
    this.state = {
      caughtErrors: []
    };
  }

  getState (stringOrArrayOfKeys) {
    if (stringOrArrayOfKeys === undefined) return clone(this.state);
    if (toType(stringOrArrayOfKeys) === 'array') {
      return this.getStateByArrayOfKeys(stringOrArrayOfKeys);
    }
    if (toType(stringOrArrayOfKeys) === 'string') {
      return this.getStateByKey(stringOrArrayOfKeys);
    }
  }

  // Returns a value only
  getStateByKey (key) {
    if (ALLOWED_STATES[key] === undefined) {
      throw new Error(`The desired state property "${key}" from StateStore is not allowed.`);
    }
    if (['object', 'array'].indexOf(ALLOWED_STATES[key]) > -1) {
      return clone(this.state[key]);
    }
    return this.state[key];
  }

  // Returns an object of key: value pairs
  getStateByArrayOfKeys (arrayOfKeys) {
    let objects = arrayOfKeys.map(key => {
      return {[key]: this.getStateByKey(key)} // ES2015 computed property names
    });
    return Object.assign(...objects);
  }

  setState (obj) {
    this.statesAreAllowed(obj);
    let newState = Object.assign({}, this.state, obj);
    if (!this.statesAreEqual(newState)) {
      this.state = newState;
      this.emit('STATE_UPDATED');
    }
  }

  statesAreAllowed (obj) {
    traverseObject(obj, (k, v) => {
      if (ALLOWED_STATES[k] === undefined) {
        throw new Error(`There is no entry for "${k}" in StateStore's allowed states.`);
      }
      if (ALLOWED_STATES[k] !== toType(v)) {
        throw new Error(`StateStore was expecting the type of ${k} to be ${ALLOWED_STATES[k]}. ${toType(v)} was given.`)
      }
    })
  }

  stateExists (key) {
    return this.state[key] !== undefined;
  }

  stateValueEquals (key, newValue) {
    if (!this.stateExists(key)) return false;
    let stateValue = this.state[key];
    let theType = toType(stateValue);

    if (theType !== toType(newValue)) return false;
    if (['array','object'].indexOf(theType) > -1) {
      return JSON.stringify(newValue) === JSON.stringify(stateValue);
    }
    return newValue === stateValue;
  }

  statesAreEqual (newState) {
    let equal = true;
    traverseObject(newState, (k, v) => {
      if (!this.stateValueEquals(k, v)) {
        equal = false;
      }
    })
    return equal;
  }

  handleActions(action) {
    switch(action.type) {
      case 'SET_STATE':
        this.setState(action.state);
      break;
      default: break;
    }
  }
}

const stateStore = new StateStore();
dispatcher.register(stateStore.handleActions.bind(stateStore))

if (isDevelopment()) {
  window.StateStore = stateStore;
}

export default stateStore;
