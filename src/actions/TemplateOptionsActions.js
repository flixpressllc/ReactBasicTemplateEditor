import dispatcher from './dispatcher';

export function setTemplateOptions (templateOptions) {
  dispatcher.dispatch(Object.assign({type: 'SET_OPTIONS'}, {templateOptions}))
}
