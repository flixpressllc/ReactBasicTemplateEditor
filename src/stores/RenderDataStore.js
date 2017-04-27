import { EventEmitter } from 'events';
import dispatcher from '../actions/dispatcher';
import * as Containers from '../utils/globalContainerConcerns';

import { clone, isObject } from 'happy-helpers';

class RenderDataStore extends EventEmitter {
  constructor () {
    super();
    this.state = {
      receivedInitial: false
    }
  }
  _changeContainer(dataType, fieldName, newData) {
    let containerName = Containers.getContainerNameFor(dataType);
    Object.assign(this.containers[containerName][fieldName], newData);
    this.emit('change', {containerName, dataType, fieldName});
  }

  _addMissingContainers() {
    if (!isObject(this.containers)) {
      this.containers = {};
    }
    Containers.getContainerNames().map(name => {
      if (!this.containers.hasOwnProperty(name)) {
        this.containers[name] = {};
      }
    })
  }

  getAllContainers() {
    if ( ! this.state.receivedInitial) this._addMissingContainers();
    return this.containers ? clone(this.containers) : {};
  }

  _handleActions(action) {
    switch(action.type) {
      case 'CHANGE_CONTAINER':
        this._changeContainer(action.dataType, action.fieldName, action.newData);
      break;
      case 'RECEIVE_INITIAL_CONTAINER_VALUES':
        this.state.receivedInitial = true;
        this.containers = action.containers;
        this.emit('change');
      break;
    }
  }
}

const renderDataStore = new RenderDataStore;
dispatcher.register(renderDataStore._handleActions.bind(renderDataStore))
window.renderDataStore = renderDataStore;
export default renderDataStore;
