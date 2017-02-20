import React from 'react';
import {CheckBox} from './imports';
import confirm from '../utils/confirm';
import {round} from '../utils/helper-functions';
import AccountBalance from './AccountBalance';
import { find } from '../utils/dom-queries';
import './SubmitRender.scss';

export default React.createClass({
  displayName: 'SubmitRender',
  componentWillMount: function () {
    find('form').on('submit', e => this.handleSubmit(e) );
  },

  handleSubmit: function (e) {
    if (this.props.allowSubmit !== true){
      e.preventDefault();
      this.confirmOrder();
    }
  },

  confirmOrder: function () {
    var sd = this.props.userSettingsData;
    // .NET normalize
    var isChargePerOrder = (sd.isChargePerOrder === false || sd.isChargePerOrder === 'False') ? false : true;

    var depletionMessage, balanceType;

    if (isChargePerOrder) {
      balanceType = '(USD)';
      depletionMessage = `cost $${sd.renderCost} ${balanceType}`;
    } else {
      balanceType = 'minutes';
      depletionMessage = `use ${round(sd.minimumTemplateDuration)} ${balanceType} of your monthly video`;
    }
    var message = <div className="reactBasicTemplateEditor-SubmitRender-orderConfirmationMessage">
      <p>You are about to place an order which would {depletionMessage}. All orders are final.</p>
      <p>Are you sure you want to place an order?</p>
      </div>;

    var options = {
      otherAction: this.props.placePreviewOrder,
      otherActionLabel: 'Make a Preview instead',
      proceedLabel:'Yes: Place Order'
    };

    if (this.props.isPreview !== true) {
      confirm(message,options).then(() => {
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
      <div className="reactBasicTemplateEditor-SubmitRender">
        <AccountBalance userSettingsData={this.props.userSettingsData} isPreview={false}/>
        <input className="reactBasicTemplateEditor-SubmitRender-previewButton" value="Create Preview" type="button" onClick={this.props.placePreviewOrder} />
        <input name="Submit_BT" value="Submit Order" type="submit" id="Submit_BT" />
      </div>
    )
  }
});
