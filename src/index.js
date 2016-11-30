import '../cfg/polyfills';
import React from 'react';
import ReactDOM from 'react-dom';
import EditorUserInterface from './components/EditorUserInterface';

require('reset.css');
require('./styles/editor.scss');

let reactPromise = $.Deferred();
// In the future, React Engine may be loaded separately...
function tryReact () {
  if (React === undefined || ReactDOM === undefined) {
    setTimeout(tryReact, 1000);
  } else {
    reactPromise.resolve();
  }
}

function initializeTemplateEditor (options) {
  let settings = {
    uiSettingsJsonUrl: options.uiSettingsJsonUrl,
    userSettingsData: options.userSettingsData
  };
  reactPromise.done(function () {
    ReactDOM.render(
      React.createElement(EditorUserInterface, settings),
      document.getElementById(options.divToReplaceId)
    );
  });
}

tryReact();

window.initializeTemplateEditor = initializeTemplateEditor;
