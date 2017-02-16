import dispatcher from '../stores/dispatcher';

export function changeContainer (dataType, fieldName, newData) {
  dispatcher.dispatch(Object.assign({type: 'CHANGE_CONTAINER'}, {dataType}, {fieldName}, {newData}))
}