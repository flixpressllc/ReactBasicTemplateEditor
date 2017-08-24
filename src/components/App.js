import React from 'react';
import * as TemplateSpecActions from '../actions/TemplateSpecActions';
import * as TemplateOptionsActions from '../actions/TemplateOptionsActions';
import * as StateActions from '../actions/StateActions';
import { find } from '../utils/dom-queries';
import { adjustColorbox } from '../utils/colorbox-manipulation';

import Messages from './UserMessages';
import SubmitRender from './SubmitRender';
import ResolutionPicker from './ResolutionPicker';
import SpecFields from './SpecFields';
import SoundPicker from './SoundPicker';
import Modal from './lib/Modal';

// This must be called after all the actual containers are called so they can
// register themselves before RenderDataStore inside dataLayer tries to get them all...
import RenderDataStore from '../stores/RenderDataStore';
import dl from '../utils/dataLayer';

import StateStore from '../stores/StateStore';

import './App.scss';

class App extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      allowSubmit: false,
      caughtErrors: []
    };

    StateActions.setState({
      templateType: props.templateType,
      templateId: parseInt(props.templateId, 10),
      username: props.userSettingsData.username,
      imageAspectRatio: props.imageAspectRatio
    });

    this.handlePlaceOrder = this.handlePlaceOrder.bind(this);
    this.handlePlacePreviewOrder = this.handlePlacePreviewOrder.bind(this);
    this.handleChooseSong = this.handleChooseSong.bind(this);
    this.handlePreviewChange = this.handlePreviewChange.bind(this);
    this.handleResolutionIdChange = this.handleResolutionIdChange.bind(this);
    this.handleUpdateCaughtErrors = this.handleUpdateCaughtErrors.bind(this);
    this.handleUpdateTemplateOptions = this.handleUpdateTemplateOptions.bind(this);
    this.editorSetupDidComplete = this.editorSetupDidComplete.bind(this);

    StateStore.on('STATE_UPDATED', this.handleUpdateCaughtErrors);

    RenderDataStore.on('TEMPLATE_OPTIONS_CHANGED', this.handleUpdateTemplateOptions);
  }

  handleUpdateTemplateOptions () {
    this.forceUpdate();
  }

  handlePlacePreviewOrder () {
    TemplateOptionsActions.setTemplateOptions({isPreview: true});
    this.handlePlaceOrder();
  }

  handleUpdateCaughtErrors () {
    this.setState(StateStore.getState(['caughtErrors']));
  }

  setupEditor () {
    return dl.setupEditor(this.props.uiSettingsJsonUrl);
  }

  componentDidMount () {
    TemplateSpecActions.setSpecs({templateId: parseInt(this.props.templateId, 10)});
    this.setupEditor().then(this.editorSetupDidComplete);
  }

  editorSetupDidComplete () {
    // This doesn't mean that the images and such have acutally loaded,
    // so the height of the editor is not yet determined, etc.
    this.setState( {editorSetupIsComplete: true} );
    setTimeout(() => adjustColorbox(), 500)
  }

  componentWillUnmount () {
    StateStore.removeEventListener('STATE_UPDATED', this.handleUpdateCaughtErrors);
    RenderDataStore.removeEventListener('TEMPLATE_OPTIONS_CHANGED', this.handleUpdateTemplateOptions);
  }

  handleResolutionIdChange (id) {
    TemplateOptionsActions.setTemplateOptions({resolutionId: id});
  }

  handlePreviewChange (e) {
    TemplateOptionsActions.setTemplateOptions({isPreview: e.target.checked});
  }

  handlePlaceOrder () {

    if (dl.prepOrderForSubmit()) {
      this.setState({allowSubmit: true}, function () {
        setTimeout(function(){ find('form input[type="submit"]')[0].click(); }, 100);
      });
    } else {
      throw new Error('Submission failed.');
    }
  }

  handleChooseSong (audioInfo) {
    TemplateOptionsActions.setTemplateOptions({audioInfo});
  }

  render() {
    var resolutionPicker = null;
    if (this.state.editorSetupIsComplete) {
      resolutionPicker = (
        <ResolutionPicker
          resolutionOptions={RenderDataStore.getTemplateOptions('resolutionOptions')}
          resolutionIdChange={this.handleResolutionIdChange}
          chosen={RenderDataStore.getTemplateOptions('resolutionId')}
          disabled={RenderDataStore.getTemplateOptions('isPreview')}
        />
      );
    }
    var specFields = null;
    if (this.state.editorSetupIsComplete) {
      specFields = (
        <SpecFields
          templateType={ StateStore.getState('templateType')}
          uiSections={RenderDataStore.getUiDefinition()}
          imageBank={RenderDataStore.getTemplateOptions('imageBank')}
        />
      );
    }

    return (
      <div className="reactBasicTemplateEditor-App">
        <h1 className="reactBasicTemplateEditor-App-title">
          <span>Template {this.props.templateId}</span>
        </h1>
        <Messages messages={this.state.caughtErrors} typeOverride="bad"/>
        <div className="reactBasicTemplateEditor-App-formArea">
            <div className="reactBasicTemplateEditor-App-column">
            { specFields }
          </div>
          <div className="reactBasicTemplateEditor-App-column">
            <SoundPicker
              audioInfo={RenderDataStore.getTemplateOptions('audioInfo')}
              username={this.props.userSettingsData.username}
              onChooseSong={this.handleChooseSong}
            />
            {resolutionPicker}
            <SubmitRender
              isPreview={RenderDataStore.getTemplateOptions('isPreview')}
              onChange={this.handlePreviewChange}
              placeOrder={this.handlePlaceOrder}
              allowSubmit={this.state.allowSubmit}
              userSettingsData={this.props.userSettingsData}
              placePreviewOrder={this.handlePlacePreviewOrder}
            />
          </div>
        </div>
        <Modal
          isOpen={this.state.allowSubmit}
          className="reactBasicTemplateEditor-App-submissionModalSuccess"
          overlayClassName="reactBasicTemplateEditor-App-submissionModalSuccessOverlay"
          contentLabel="Submission Modal"
        >
          Your order is being submitted.
        </Modal>
      </div>
    );
  }
}

export default App;
