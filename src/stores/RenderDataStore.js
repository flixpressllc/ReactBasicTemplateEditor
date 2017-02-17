import { EventEmitter } from 'events';
import dispatcher from './dispatcher';
import * as Containers from '../utils/globalContainerConcerns';

import { clone } from '../utils/helper-functions';

class RenderDataStore extends EventEmitter {
  changeContainer(dataType, fieldName, newData) {
    let containerName = Containers.getContainerNameFor(dataType);
    Object.assign(this.containers[containerName][fieldName], newData);
    this.emit('change', {containerName, dataType, fieldName});
  }

  getAll() {
    return this.containers ? clone(this.containers) : {};
  }
  
  handleActions(action) {
    switch(action.type) {
      case 'CHANGE_CONTAINER':
        this.changeContainer(action.dataType, action.fieldName, action.newData);
        break;
      case 'RECEIVE_INITIAL_CONTAINER_VALUES':
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
