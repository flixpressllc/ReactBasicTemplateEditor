import '../cfg/polyfills';
import React from 'react';
import ReactDOM from 'react-dom';
import EditorUserInterface from './components/EditorUserInterface';

require('reset.css');

let reactPromise = new Promise((resolve) => {
// In the future, React Engine may be loaded separately...
  function tryReact () {
    if (React === undefined || ReactDOM === undefined) {
      setTimeout(tryReact, 1000);
    } else {
      resolve();
    }
  }
  tryReact();
});

function initializeTemplateEditor (options) {
  let settings = {
    uiSettingsJsonUrl: options.uiSettingsJsonUrl,
    userSettingsData: options.userSettingsData
  };
  reactPromise.then(function () {
    ReactDOM.render(
      React.createElement(EditorUserInterface, settings),
      document.getElementById(options.divToReplaceId)
    );
  });
}

window.initializeTemplateEditor = initializeTemplateEditor;
