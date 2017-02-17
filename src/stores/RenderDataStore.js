import { EventEmitter } from 'events';
import dispatcher from './dispatcher';
import * as Containers from '../utils/globalContainerConcerns';

import { clone, isObject } from '../utils/helper-functions';

class RenderDataStore extends EventEmitter {
  constructor () {
    super();
    this.state = {
      receivedInitial: false
    }
  }
  changeContainer(dataType, fieldName, newData) {
    let containerName = Containers.getContainerNameFor(dataType);
    Object.assign(this.containers[containerName][fieldName], newData);
    this.emit('change', {containerName, dataType, fieldName});
  }
  
  addMissingContainers() {
    if (!isObject(this.containers)) {
      this.containers = {};
    }
    Containers.getContainerNames().map(name => {
      if (!this.containers.hasOwnProperty(name)) {
        this.containers[name] = {};
      }
    })
  }

  getAll() {
    if ( ! this.state.receivedInitial) this.addMissingContainers();
    return this.containers ? clone(this.containers) : {};
  }
  
  handleActions(action) {
    switch(action.type) {
      case 'CHANGE_CONTAINER':
        this.changeContainer(action.dataType, action.fieldName, action.newData);
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
dispatcher.register(renderDataStore.handleActions.bind(renderDataStore))
window.renderDataStore = renderDataStore;
export default renderDataStore;
