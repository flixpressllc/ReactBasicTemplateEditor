import '../cfg/polyfills';
import React from 'react';
import ReactDOM from 'react-dom';
import EditorUserInterface from './components/EditorUserInterface';

require('reset.css');

// Hack to get around server side code for now...
if($('head').find('meta[content="width=device-width, initial-scale=1.0"]').length < 1) {
  $('head').append($('<meta name="viewport" content="width=device-width, initial-scale=1.0">'));
}
// Ok. Onward...

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
    templateType: options.templateType,
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
