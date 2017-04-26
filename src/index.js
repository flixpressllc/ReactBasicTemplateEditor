import '../cfg/polyfills';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { find } from './utils/dom-queries';

require('reset.css');

// Hack to get around server side code for now...
if( find('head meta[content="width=device-width, initial-scale=1.0"]').length < 1 ) {
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1.0';
  document.head.appendChild(meta);
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
    templateId: options.templateId,
    uiSettingsJsonUrl: options.uiSettingsJsonUrl,
    userSettingsData: options.userSettingsData
  };
  reactPromise.then(function () {
    ReactDOM.render(
      React.createElement(App, settings),
      document.getElementById(options.divToReplaceId)
    );
  });
}

window.initializeTemplateEditor = initializeTemplateEditor;
