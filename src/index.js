import 'core-js/fn/object/assign';
import React from 'react';
import ReactDOM from 'react-dom';
import EditorUserInterface from './components/Main';

// someday:
// export default EditorUserInterface;
// for now:

window.React = React;
window.ReactDOM = ReactDOM;
window.EditorUserInterface = EditorUserInterface;
