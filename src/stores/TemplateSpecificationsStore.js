import { EventEmitter } from 'events';
import dispatcher from './dispatcher';
import { clone, traverseObject, toType } from 'happy-helpers';

const ALLOWED_SPECS = {
  templateId: 'number',
  maxImages: 'number',
  minImages: 'number'
}

class TemplateSpecificationsStore extends EventEmitter {
  constructor () {
    super();
    this.specs = {
      templateId: 0,
      maxImages: 0,
      minImages: 0
    }
    this.initialRecieved = {
      templateId: false,
      maxImages: false,
      minImages: false
    }
  }

  getSpec (stringOrArrayOfKeys) {
    if (stringOrArrayOfKeys === undefined) return clone(this.specs);
    if (toType(stringOrArrayOfKeys) === 'array') {
      return this.getSpecByArrayOfKeys(stringOrArrayOfKeys);
    }
    if (toType(stringOrArrayOfKeys) === 'string') {
      return this.getSpecByKey(stringOrArrayOfKeys);
    }
  }

  // Returns a value only
  getSpecByKey (key) {
    if (ALLOWED_SPECS[key] === undefined) {
      throw new Error(`The desired spec property "${key}" from TemplateSpecificationsStore is not allowed.`);
    }
    if (['object', 'array'].indexOf(ALLOWED_SPECS[key]) > -1) {
      return clone(this.specs[key]);
    }
    return this.specs[key];
  }

  // Returns an object of key: value pairs
  getSpecByArrayOfKeys (arrayOfKeys) {
    let objects = arrayOfKeys.map(key => {
      return {[key]: this.getSpecByKey(key)} // ES2015 computed property names
    });
    return Object.assign(...objects);
  }

  setInitialRecieved (obj) {
    traverseObject(obj, (k) => {
      this.initialRecieved[k] = true;
    });
  }

  setSpecs (obj) {
    this.specsAreAllowed(obj);
    let newSpec = Object.assign({}, this.specs, obj);
    if (!this.specsAreEqual(newSpec)) {
      this.setInitialRecieved(obj);
      this.specs = newSpec;
      this.emit('SPECS_UPDATED');
    }
  }

  specsAreAllowed (obj) {
    traverseObject(obj, (k, v) => {
      if (ALLOWED_SPECS[k] === undefined) {
        throw new Error(`There is no entry for "${k}" in TemplateSpecificationsStore's allowed specs.`);
      }
      if (ALLOWED_SPECS[k] !== toType(v)) {
        throw new Error(`TemplateSpecificationsStore was expecting the type of ${k} to be ${ALLOWED_SPECS[k]}. ${toType(v)} was given.`)
      }
      if (this.initialRecieved[k]) {
        // eslint-disable-next-line no-console
        console.warn(`TemplateSpecificationsStore has already recieved an initial value for ${k}. It should not be changed.`)
      }
    })
  }

  specExists (key) {
    return this.specs[key] !== undefined;
  }

  specValueEquals (key, newValue) {
    if (!this.specExists(key)) return false;
    let specValue = this.specs[key];
    let theType = toType(specValue);

    if (theType !== toType(newValue)) return false;
    if (['array','object'].indexOf(theType) > -1) {
      return JSON.stringify(newValue) === JSON.stringify(specValue);
    }
    return newValue === specValue;
  }

  specsAreEqual (newState) {
    let equal = true;
    traverseObject(newState, (k, v) => {
      if (!this.specValueEquals(k, v)) {
        equal = false;
      }
    })
    return equal;
  }

  handleActions(action) {
    switch(action.type) {
      case 'SET_SPECS':
        this.setSpecs(action.specs);
      break;
      default: break;
    }
  }
}

const specStore = new TemplateSpecificationsStore();
dispatcher.register(specStore.handleActions.bind(specStore))

export default specStore;
window.specStore = specStore;