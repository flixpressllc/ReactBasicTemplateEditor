import dispatcher from '../stores/dispatcher';

export function changeContainer (dataType, fieldName, newData) {
  dispatcher.dispatch(Object.assign({type: 'CHANGE_CONTAINER'}, {dataType}, {fieldName}, {newData}))
}

export function setInitialContainerValues (containers) {
  dispatcher.dispatch(Object.assign({type: 'RECEIVE_INITIAL_CONTAINER_VALUES'}, {containers}))
}
