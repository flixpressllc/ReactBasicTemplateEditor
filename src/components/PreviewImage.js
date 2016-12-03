import React from 'react';
import {clone} from './imports';
import Modal from 'react-modal';
import cx from 'classnames';
import {m} from '../styles/styles';
import './PreviewImage.scss';

const urlPartial = '/templates/images/';

export default React.createClass({
  getInitialState: function () {
    let image = '';
    if (this.props.image){
      image = urlPartial + this.props.image;
    }
    return {
      image: image,
      style: {backgroundSize: 'contain'},
      modalIsOpen: false,
      missing: false
    };
  },
  
  setMissingViaResponse: function (jqXHR) {
    let isMissing = true;
    let fileIsImage = jqXHR.getResponseHeader('Content-Type').indexOf('image') !== -1;
    if (jqXHR.status === 200 && fileIsImage) {
      isMissing = false;
    }
    this.setState({
      missing: isMissing
    });
  },
  
  componentWillReceiveProps: function(newProps) {
    if (newProps.image != this.props.image && newProps.image !== '') {
      if (this.currentCheck) this.currentCheck.abort();
      var style = clone(this.state.style);
      style.backgroundImage = `url("${urlPartial + newProps.image}")`;
      this.setState({
        style: style,
        image: urlPartial + newProps.image,
        missing: false
      });
      this.currentCheck = $.ajax({
        url: urlPartial + newProps.image,
        type: 'HEAD'
      }).done((data, status, jqXHR)=>{
        this.setMissingViaResponse(jqXHR);
      }).fail((jqXHR /*, status, error */)=>{
        this.setMissingViaResponse(jqXHR);
      });
    }
  },
  
  openModal: function () {
    if (this.state.missing) return;
    this.setState({modalIsOpen: true})
  },
  
  closeModal: function () {
    this.setState({modalIsOpen: false})
  },

  
  render: function(){
    var message = 'click to enlarge';
    if (this.state.missing === true) {
      message = 'Preview unavailable. Continue editing.';
    }
    if (this.props.image === '') {
      return (<div className="reactBasicTemplateEditor-PreviewImage"></div>)
    }
    let mainImageClasses = cx(
      'reactBasicTemplateEditor-PreviewImage-mainImage',
      {'missing': this.state.missing}
    );

    return (
      <div className="reactBasicTemplateEditor-PreviewImage">
        <div className={ mainImageClasses }
          style={m({cursor: 'default'},this.state.style)}
          onClick={this.openModal}>
          <span className="reactBasicTemplateEditor-PreviewImage-mainImageMessage">
            {message}
          </span>
        </div>
        <Modal
          ref="modal"
          closeTimeoutMS={150}
          isOpen={this.state.modalIsOpen}
          className="reactBasicTemplateEditor-PreviewImage-modal modal"
          overlayClassName="preview-image-modal-overlay overlay">

          <img
            className="reactBasicTemplateEditor-PreviewImage-modalImage" 
            src={this.state.image}/>
          
          <button
            className="reactBasicTemplateEditor-PreviewImage-modalCloseButton"
            type="button"
            onClick={this.closeModal}>
            Close
          </button>
          
          <div className="reactBasicTemplateEditor-PreviewImage-modalExplain">
            (This image doesn't represent your final render. It is just an example to help illustrate the last field you worked with.)
          </div>
        </Modal>
      </div>
    );
  }
});
