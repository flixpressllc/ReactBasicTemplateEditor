import dispatcher from './dispatcher';

export function setSpecs (specs) {
  dispatcher.dispatch(Object.assign({type: 'SET_SPECS'}, {specs}))
}
