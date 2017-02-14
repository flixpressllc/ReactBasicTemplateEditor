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

    var depletionMessage, balance, resultingBalance, balanceType;

    if (isChargePerOrder) {
      balanceType = '(USD)';
      depletionMessage = `cost $${sd.renderCost} ${balanceType}`;
      balance = '';
      resultingBalance = '';
    } else {
      balanceType = 'minutes';
      depletionMessage = `use ${round(sd.minimumTemplateDuration)} ${balanceType} of your monthly video`;
      balance = `${round(sd.minutesRemainingInContract)} ${balanceType}`;
      resultingBalance = `${round(sd.minutesRemainingInContract - sd.minimumTemplateDuration)} ${balanceType}`;
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
        <AccountBalance userSettingsData={this.props.userSettingsData} isPreview={this.props.isPreview}/>
        <CheckBox onChange={this.props.onChange} checked={!!this.props.isPreview}>Preview</CheckBox>
        <input name="Submit_BT" value={text} type="submit" id="Submit_BT" />
      </div>
    )
  }
});
