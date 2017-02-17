import { EventEmitter } from 'events';
import dispatcher from './dispatcher';
import * as Containers from '../utils/globalContainerConcerns';

import { clone } from '../utils/helper-functions';

class RenderDataStore extends EventEmitter {
  constructor() {
    super();
    this.containers = Containers.getContainerNames().reduce( (a, name) => {
      a[name] = {};
      return a;
    }, {})
  }

  changeContainer(dataType, fieldName, newData) {
    let containerName = Containers.getContainerNameFor(dataType);
    this.containers[containerName][fieldName] = clone(newData);
    this.emit('change');
  }

  getAll() {
    return clone(this.containers);
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
