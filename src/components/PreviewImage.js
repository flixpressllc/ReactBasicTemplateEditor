import React from 'react';
import {clone} from './imports';
import Modal from 'react-modal';
import cx from 'classnames';
import {m} from '../styles/styles';

const URL_PARTIAL = '/templates/images/';

export default React.createClass({
  getInitialState: function () {
    let image = '';
    if (this.props.type && this.props.name){
      image = this.getPreviewImage(this.props.type, this.props.name);
    }
    return {
      image: image,
      style: {backgroundSize: 'contain', backgroundImage: image},
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
  
  getPreviewImage: function (type, identifier) {
    if (type === 'TextField') {
      return URL_PARTIAL + this.props.fields.textFields[identifier].previewImage
    
    } else if (type === 'YouTubeLink') {
      let videoId = this.props.fields.youTubeLinks[identifier].videoId
      if (videoId) {
        return `https://img.youtube.com/vi/${ videoId }/hqdefault.jpg`;
      }
      return '';
    
    } else if (type === 'TextBox') {
        return URL_PARTIAL + this.props.fields.textBoxes[identifier].previewImage
      
    } else if (type === 'DropDown') {
      let value = this.props.fields.dropDowns[identifier].value;
      for (var i = this.props.fields.dropDowns[identifier].options.length - 1; i >= 0; i--) {
        if (this.props.fields.dropDowns[identifier].options[i].value === value) {
          return URL_PARTIAL + this.props.fields.dropDowns[identifier].options[i].previewImage;
        }
      }
    }
    
    return this.state.image;
  },
  
  setImage: function (newImage) {
    if (newImage != this.state.image && newImage !== '') {
      if (this.currentCheck) this.currentCheck.abort();
      var style = clone(this.state.style);
      style.backgroundImage = `url("${newImage}")`;
      this.setState({
        style: style,
        image: newImage,
        missing: false
      });
      this.currentCheck = $.ajax({
        url: newImage,
        type: 'HEAD'
      }).done((data, status, jqXHR)=>{
        this.setMissingViaResponse(jqXHR);
      }).fail((jqXHR /*, status, error */)=>{
        this.setMissingViaResponse(jqXHR);
      });
    }
  },
  
  componentWillReceiveProps: function(newProps) {
    let image = this.getPreviewImage(newProps.type, newProps.name)
    if (this.state.image !== image) {
      this.setImage(image);
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
    if (this.state.image === '') {
      return (<div className="preview-image-component component"></div>)
    }
    return (
      <div className="preview-image-component component">
        <div className={cx('preview-image',{'missing': this.state.missing})} style={m({cursor: 'default'},this.state.style)} onClick={this.openModal}>
          <span>{message}</span>
        </div>
        <Modal
          ref="modal"
          closeTimeoutMS={150}
          isOpen={this.state.modalIsOpen}
          className="preview-image-modal modal"
          overlayClassName="preview-image-modal-overlay overlay">
          <img src={ this.state.image }/>
          <button type="button" onClick={this.closeModal}>close</button>
          <div className="explain">(This image doesn't represent your final render. It is just an example to help illustrate the last field you worked with.)</div>
        </Modal>
      </div>
    );
  }
});
