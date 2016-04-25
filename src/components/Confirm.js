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
      okLabel = 'OK',
      cancelLabel = 'Cancel',
      confirmation,
      show,
      proceed,
      dismiss,
      cancel
    } = this.props;

    const actions = [
      <button key="cancel" type="button" className="cancel" onClick={cancel}>
        {cancelLabel}
      </button>,
      <button key="confirm" type="button" className="confirm" onClick={proceed}>
        {okLabel}
      </button>
    ];

    return (
      <Dialog
        isOpen={show}
        onRequestClose={dismiss}
        className="confirm-modal modal"
        overlayClassName="confirm-modal-overlay overlay"
        //title={title}
        //modal={modal}
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
