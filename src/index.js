import 'core-js/fn/object/assign';
import React from 'react';
import ReactDOM from 'react-dom';
import EditorUserInterface from './components/Main';

require('reset.css');
require('./styles/editor.sass');

// someday:
// export default EditorUserInterface;
// for now:
window.React = React;
window.ReactDOM = ReactDOM;
window.EditorUserInterface = EditorUserInterface;
