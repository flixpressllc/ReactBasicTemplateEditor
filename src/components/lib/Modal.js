import React from 'react';
import cx from 'classnames';
import ReactModal from 'react-modal';
import {CONTAINING_ELEMENT_ID} from '../../config/unavoidable-constants';

import './Modal.scss';

ReactModal.setAppElement('#' + CONTAINING_ELEMENT_ID);

const Modal = React.createClass({
  displayName: 'Modal',
  getPropOverrides: function () {
    return {
      className: cx('reactBasicTemplateEditor-Modal', this.props.className),
      overlayClassName: this.props.overlayClassName || 'reactBasicTemplateEditor-Modal-overlay'
    }
  },

  render: function(){
    const passAlong = Object.assign({}, this.props, this.getPropOverrides());
    return(
      <ReactModal {...passAlong} />
    )
  }
});

export default Modal;
