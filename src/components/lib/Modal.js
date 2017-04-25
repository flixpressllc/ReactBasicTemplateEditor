import React from 'react';
import cx from 'classnames';
import ReactModal from 'react-modal';
import {CONTAINING_ELEMENT_ID} from '../../config/unavoidable-constants';

import './Modal.scss';

ReactModal.setAppElement('#' + CONTAINING_ELEMENT_ID);

function getPropOverrides (props) {
  return {
    className: cx('reactBasicTemplateEditor-Modal', props.className),
    overlayClassName: props.overlayClassName || 'reactBasicTemplateEditor-Modal-overlay'
  }
}

const Modal = (props) => {
  const passAlong = Object.assign({}, props, getPropOverrides(props));
  return(
    <ReactModal {...passAlong} />
  )
}

export default Modal;
