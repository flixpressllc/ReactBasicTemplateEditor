import React from 'react';
import {CheckBox} from './imports';
import confirm from '../utils/confirm';

export default React.createClass({
  componentWillMount: function () {
    $('form').on('submit', (e)=>{
      this.handleSubmit(e);
    });
  },
  
  
  handleSubmit: function (e) {
    if (this.props.allowSubmit === false){
      e.preventDefault();
      this.confirmOrder();
    }
  },
  
  confirmOrder: function () {
    var message = '';
    const orderMessage = 'You are about to place an order. All orders are final.\n\nIf you would like to create a preview instead, check the preview checkbox. \n\nAre you sure you want to place an order?';
    // const previewMessage = 'You used the enter key to submit a preview. Did you mean to do that?';
    
    if (this.props.isPreview !== true) {
      message = orderMessage;
      confirm(message).then(() => {
        // proceed
        this.props.placeOrder();
      }, () => {
        // cancel
      });
    } else {
      this.props.placeOrder();
    }
  },
  
  render: function () {
    var text = (this.props.isPreview) ? 'Render Preview' : 'Submit Order'
    return (
      <div className="submit-render-component component">
        <CheckBox onChange={this.props.onChange} checked={this.props.isPreview}>Preview</CheckBox>
        <input name="Submit_BT" value={text} type="submit" id="Submit_BT" />
      </div>
    )
  }
});
