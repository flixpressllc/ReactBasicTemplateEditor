import React from 'react';
import Dialog from './lib/Modal';
import { confirmable } from 'react-confirm';
import './Confirm.scss'

class Confirmation extends React.Component {

  render() {
    const {
      // title,
      // modal,
      proceedLabel = 'OK',
      cancelLabel = 'Cancel',
      otherActionLabel = 'Option 3',
      otherAction,
      confirmation,
      show,
      proceed,
      dismiss,
      cancel,
      contentLabel
    } = this.props;

    var actions = [
      <button key="cancel" type="button" className="reactBasicTemplateEditor-Confirm-button cancel" onClick={cancel}>
        {cancelLabel}
      </button>,
      <button key="confirm" type="button" className="reactBasicTemplateEditor-Confirm-button confirm" onClick={proceed}>
        {proceedLabel}
      </button>
    ];

    if (otherAction) {
      actions.push(
        <button key="preview" type="button" className="reactBasicTemplateEditor-Confirm-button confirm confirm-preview" onClick={otherAction}>
          {otherActionLabel}
        </button>
      );
    }

    return (
      <Dialog
        isOpen={show}
        onRequestClose={dismiss}
        className="reactBasicTemplateEditor-Confirm"
        overlayClassName="reactBasicTemplateEditor-Confirm-overlay"
        contentLabel={contentLabel}
      >
        <div>
          {confirmation}
        </div>
        <div className="buttons">
          {actions}
        </div>
      </Dialog>
    );
  }
}

export default confirmable(Confirmation);
