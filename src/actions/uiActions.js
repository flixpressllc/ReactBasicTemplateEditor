import dispatcher from './dispatcher';

export function setUiDefinition (uiDefinition) {
  dispatcher.dispatch(Object.assign({type: 'SET_UI_DEFINITION'}, {uiDefinition}))
}
