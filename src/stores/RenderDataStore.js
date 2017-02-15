import { EventEmitter } from 'events';
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
    return this.containers;
  }
}

const renderDataStore = new RenderDataStore;
window.RenderDataStore = renderDataStore;
export default renderDataStore;
