import React from 'react';
import * as TemplateSpecActions from '../actions/TemplateSpecActions';
import * as StateActions from '../actions/StateActions';
import { find } from '../utils/dom-queries';
import * as renderDataAdapter from '../utils/renderDataAdapter';
import { adjustColorbox } from '../utils/colorbox-manipulation';

import Messages from './UserMessages';
import SubmitRender from './SubmitRender';
import ResolutionPicker from './ResolutionPicker';
import SpecFields from './SpecFields';
import SoundPicker from './SoundPicker';
import Modal from './lib/Modal';

// This must be called after all the actual containers are called so they can
// register themselves before RenderDataStore inside dataLayer tries to get them all...
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

    StateActions.setState({templateType: props.templateType})
    StateActions.setState({templateId: parseInt(props.templateId, 10)})

    this.handlePlaceOrder = this.handlePlaceOrder.bind(this);
    this.handlePlacePreviewOrder = this.handlePlacePreviewOrder.bind(this);
    this.handleChooseSong = this.handleChooseSong.bind(this);
    this.handlePreviewChange = this.handlePreviewChange.bind(this);
    this.handleResolutionIdChange = this.handleResolutionIdChange.bind(this);
    this.handleUpdateCaughtErrors = this.handleUpdateCaughtErrors.bind(this);

    StateStore.on('STATE_UPDATED', this.handleUpdateCaughtErrors);
  }

  handlePlacePreviewOrder () {
    this.setState({isPreview: true}, function () {
      this.handlePlaceOrder();
    });
  }

  handleUpdateCaughtErrors () {
    this.setState(StateStore.getState(['caughtErrors']));
  }

  setupEditor () { return new Promise((resolve) => {
    let getSettingsData = dl.getSettingsData(this.props.uiSettingsJsonUrl);
    getSettingsData
      .then(uiData => dl.getStartingData(uiData))
      .then(stateObject => {
        this.setState(stateObject, resolve);
      });

    getSettingsData.catch((possibleReason)=>{
      let errors = StateStore.getState('caughtErrors') || [];
      errors.push({message: 'Could not load template data.'});
      if (possibleReason) { errors.push({message: possibleReason}); }
      StateActions.setState({
        caughtErrors: errors
      });
    });
  })}

  componentDidMount () {
    TemplateSpecActions.setSpecs({templateId: parseInt(this.props.templateId, 10)});
    this.setupEditor().then(this.editorSetupDidComplete);
  }

  editorSetupDidComplete () {
    // This doesn't mean that the images and such have acutally loaded,
    // so the height of the editor is not yet determined, etc.
    setTimeout(() => adjustColorbox(), 500)
  }

  componentWillUnmount () {
    StateStore.removeEventListener('STATE_UPDATED', this.handleUpdateCaughtErrors);
  }

  handleResolutionIdChange (id) {
    this.setState({
      resolutionId: id
    })
  }

  handlePreviewChange (e) {
    this.setState({
      isPreview: e.target.checked
    })
  }

  handlePlaceOrder () {
    var order = {};

    // add necessaries
    order.ui = dl.populateOrderUi(this.state.ui);
    order.isPreview = this.state.isPreview;
    order.audioInfo = this.state.audioInfo;
    order.resolutionId = this.state.resolutionId;
    order.resolutionOptions = this.state.resolutions;
    order.imageBank = this.state.imageBank || [];

    try {
      renderDataAdapter.updateXmlForOrder(order);
      this.setState({allowSubmit: true}, function () {
        setTimeout(function(){ find('form input[type="submit"]')[0].click(); }, 100);
      });
    } catch (failureReason) {
      var message = 'Order Failed.';
      if (failureReason !== undefined){
        message += ` The given reason was "${failureReason}"`;
      }
      this.setState({
        caughtErrors: [
          {message: message}
        ]
      })
      // This method of calling console (essentially) tells the build
      // script that this is an intentional call, meant for production
      var c = console;
      c.log('Sent Object:',order);
      c.error('Order Failure: ' + failureReason);
    }
  }

  handleChooseSong (audioInfo) {
    this.setState({audioInfo: audioInfo})
  }

  render() {
    var resolutionPicker = (<span></span>);
    if (this.state.resolutionId !== undefined) {
      resolutionPicker = (
        <ResolutionPicker
          resolutionOptions={this.state.resolutions}
          resolutionIdChange={this.handleResolutionIdChange}
          chosen={this.state.resolutionId}
          disabled={this.state.isPreview}
        />
      );
    }
    var specFields = (<span></span>);
    if (this.state.ui !== undefined) {
      specFields = (
        <SpecFields
          templateType={ this.props.templateType}
          uiSections={this.state.ui}
          imageBank={ this.state.imageBank }
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
              audioInfo={this.state.audioInfo}
              username={this.props.userSettingsData.username}
              onChooseSong={this.handleChooseSong}
            />
            {resolutionPicker}
            <SubmitRender
              isPreview={this.state.isPreview}
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
