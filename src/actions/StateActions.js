import dispatcher from './dispatcher';

export function setState (state, doNotSet) {
  if (doNotSet !== undefined) {
    throw new Error('It looks like you made a call to `StateActions.setState` when you thought you were calling `this.setState`. `StateActions.setState` doesn\'t fire any callback functions.')
  }
  dispatcher.dispatch({type: 'SET_STATE', state});
}

export function initUpload () {
  let state = {isUploading: true};
  dispatcher.dispatch({type: 'SET_STATE', state});
}
