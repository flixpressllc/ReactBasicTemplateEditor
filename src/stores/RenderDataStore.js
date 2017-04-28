import { EventEmitter } from 'events';
import dispatcher from '../actions/dispatcher';
import GenericStateStore from './GenericStateStore';
import * as Containers from '../utils/globalContainerConcerns';

import { clone, isObject } from 'happy-helpers';

const ALLOWED_TEMPLATE_OPTIONS = {
  'isPreview': 'boolean',
  'audioInfo': 'object',
  'resolutionId': 'number',
  'resolutionOptions': 'array',
  'imageBank': 'array'
}

const STARTING_TEMPLATE_OPTIONS_VALUES = {
  'imageBank': [],
  'resolutionOptions': [],
  'audioInfo': {}
}


class RenderDataStore extends EventEmitter {
  constructor () {
    super();
    this.templateOptions = new GenericStateStore(ALLOWED_TEMPLATE_OPTIONS, STARTING_TEMPLATE_OPTIONS_VALUES);
    this.uiDefinition = undefined;
    this.state = {
      receivedInitial: false
    }
  }
  _changeContainer (dataType, fieldName, newData) {
    let containerName = Containers.getContainerNameFor(dataType);
    Object.assign(this.containers[containerName][fieldName], newData);
    this.emit('change', {containerName, dataType, fieldName});
  }

  _addMissingContainers () {
    if (!isObject(this.containers)) {
      this.containers = {};
    }
    Containers.getContainerNames().map(name => {
      if (!this.containers.hasOwnProperty(name)) {
        this.containers[name] = {};
      }
    })
  }

  _setTemplateOptions (templateOptions) {
    if (this.templateOptions.setState(templateOptions)) {
      this.emit('TEMPLATE_OPTIONS_CHANGED');
    }
  }

  _setUiDefinition (uiDefinition) {
    this.uiDefinition = uiDefinition;
    this.isUiDefined = true;
    this.emit('UI_DEFINED');
  }

  isUiDefined () {
    return !!this.isUiDefined;
  }

  getTemplateOptions (nameOrArrayOfNames) {
    return this.templateOptions.getState(nameOrArrayOfNames);
  }

  getUiDefinition () {
    return this.uiDefinition ? clone(this.uiDefinition) : undefined;
  }

  getAllContainers () {
    if ( ! this.state.receivedInitial) this._addMissingContainers();
    return this.containers ? clone(this.containers) : {};
  }

  _handleActions (action) {
    switch(action.type) {
      case 'CHANGE_CONTAINER':
        this._changeContainer(action.dataType, action.fieldName, action.newData);
      break;
      case 'RECEIVE_INITIAL_CONTAINER_VALUES':
        this.state.receivedInitial = true;
        this.containers = action.containers;
        this.emit('change');
      break;
      case 'SET_OPTIONS':
        this._setTemplateOptions(action.templateOptions);
      break;
      case 'SET_UI_DEFINITION':
        this._setUiDefinition(action.uiDefinition);
      break;
    }
  }
}

const renderDataStore = new RenderDataStore;
dispatcher.register(renderDataStore._handleActions.bind(renderDataStore))
window.renderDataStore = renderDataStore;
export default renderDataStore;
