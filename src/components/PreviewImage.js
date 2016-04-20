import React from 'react';
import {clone} from './imports';
import Modal from 'react-modal';

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
      modalIsOpen: false
    };
  },
  
  componentWillReceiveProps: function(newProps) {
    if (newProps.image != this.props.image && newProps.image !== '') {
      var style = clone(this.state.style);
      style.backgroundImage = `url("${urlPartial + newProps.image}")`;
      this.setState({style: style, image: urlPartial + newProps.image});
    }
  },
  
  openModal: function () {
    this.setState({modalIsOpen: true})
  },
  
  closeModal: function () {
    this.setState({modalIsOpen: false})
  },

  
  render: function(){
    if (this.props.image === '') {
      return (<div className="preview-image-component component"></div>)
    }
    return (
      <div className="preview-image-component component">
        <div className="preview-image" style={this.state.style} onClick={this.openModal}>
          <span>Click to enlarge</span>
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
