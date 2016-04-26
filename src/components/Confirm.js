import React from 'react';
import Dialog from 'react-modal';
import { confirmable } from 'react-confirm';
import {CONTAINING_ELEMENT_ID} from '../config/unavoidable-constants';

Dialog.setAppElement('#' + CONTAINING_ELEMENT_ID);
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
      cancel
    } = this.props;

    var actions = [
      <button key="cancel" type="button" className="cancel" onClick={cancel}>
        {cancelLabel}
      </button>,
      <button key="confirm" type="button" className="confirm" onClick={proceed}>
        {proceedLabel}
      </button>
    ];
    
    if (otherAction) {
      actions.push(
        <button key="preview" type="button" className="confirm confirm-preview" onClick={otherAction}>
          {otherActionLabel}
        </button>
      );
    }

    return (
      <Dialog
        isOpen={show}
        onRequestClose={dismiss}
        className="confirm-modal modal"
        overlayClassName="confirm-modal-overlay overlay"
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
