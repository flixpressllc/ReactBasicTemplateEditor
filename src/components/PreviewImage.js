import React from 'react';
import { clone, mediaWidth, isEmpty } from 'happy-helpers';
import Modal from 'react-modal';
import cx from 'classnames';
import {m} from '../styles/styles';
import { ajax } from '../utils/ajax';
import './PreviewImage.scss';
import RenderDataStore from '../stores/RenderDataStore';

const URL_PARTIAL = '/templates/images/';

export default React.createClass({
  displayName: 'PreviewImage',
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

  isLargeSize: function () {
    return mediaWidth() >= 670;
  },

  checkWidth: function () {
    if (this.isLargeSize()) {
      this.setState({largeSize: true});
    } else {
      this.setState({largeSize: false});
    }
  },

  setMissingViaResponse: function (res) {
    let isMissing = true;
    let fileIsImage = res.getResponseHeader('Content-Type').indexOf('image') !== -1;
    if (res.status === 200 && fileIsImage) {
      isMissing = false;
    }
    this.setState({
      missing: isMissing
    });
  },

  getPreviewImage: function (type, identifier) {
    const containers = RenderDataStore.getAll();
    if (isEmpty(containers)) return '';
    if (type === 'TextField') {
      return URL_PARTIAL + containers.textFields[identifier].previewImage

    } else if (type === 'YouTubeLink') {
      let videoId = containers.youTubeLinks[identifier].videoId
      if (videoId) {
        return `https://img.youtube.com/vi/${ videoId }/hqdefault.jpg`;
      }
      return '';

    } else if (type === 'TextBox') {
        return URL_PARTIAL + containers.textBoxes[identifier].previewImage

    } else if (type === 'DropDown') {
      let value = containers.dropDowns[identifier].value;
      if (value === undefined) {
        value = containers.dropDowns[identifier].default;
      }
      for (var i = containers.dropDowns[identifier].options.length - 1; i >= 0; i--) {
        if (containers.dropDowns[identifier].options[i].value === value) {
          return URL_PARTIAL + containers.dropDowns[identifier].options[i].previewImage;
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

      this.currentCheck = ajax({
        url: newImage,
        type: 'HEAD'
      })
      .then( res => this.setMissingViaResponse(res) )
      .catch( () => this.setState({isMissing: true}) );
    }
  },

  componentWillReceiveProps: function(newProps) {
    let image = this.getPreviewImage(newProps.type, newProps.name)
    if (this.state.image !== image) {
      this.setImage(image);
    }
  },

  componentDidMount: function () {
    if (window) {
      window.addEventListener('resize', this.checkWidth);
    }
    this.checkWidth();
  },

  componentWillUnmount: function () {
    if (window) {
      window.removeEventListener('resize', this.checkWidth);
    }
  },

  openModal: function () {
    if (this.state.missing || this.state.largeSize) return;
    this.setState({modalIsOpen: true})
  },

  closeModal: function () {
    this.setState({modalIsOpen: false})
  },


  render: function(){
    var message = 'click to enlarge';
    if (this.state.largeSize) {
      message = '';
    }
    if (this.state.missing === true) {
      message = 'Preview unavailable. Continue editing.';
    }
    if (this.state.image === '') {
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
          className="reactBasicTemplateEditor-PreviewImage-modal"
          contentLabel="Preview Image Modal"
          overlayClassName="reactBasicTemplateEditor-PreviewImage-modalOverlay">

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
