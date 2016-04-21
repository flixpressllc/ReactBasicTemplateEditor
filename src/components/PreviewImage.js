import React from 'react';
import {clone} from './imports';
import Modal from 'react-modal';
import cx from 'classnames';
import {m} from '../styles/styles';

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
      }).always((obj1, status, obj2)=>{
        if (status === 'abort') return;
        let xhr = status === 'success' ? obj2 : obj1;
        if (xhr.getResponseHeader('Content-Type').indexOf('image') === -1) {
          this.setState({
            missing: true
          })
        }
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
          <img src={this.state.image}/>
          <button type="button" onClick={this.closeModal}>close</button>
          <div className="explain">(This image doesn't represent your final render. It is just an example to help illustrate the last field you worked with.)</div>
        </Modal>
      </div>
    );
  }
});
