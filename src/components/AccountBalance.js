import React from 'react';
import cx from 'classnames';
import {round} from '../utils/helper-functions';

export default React.createClass({
  render: function () {
    var sd = this.props.userSettingsData;
    // .NET normalize
    var isChargePerOrder = (sd.isChargePerOrder === false || sd.isChargePerOrder === 'False') ? false : true;
    var cost, balance, type;
    if (isChargePerOrder) {
      cost = sd.renderCost;
      balance = sd.creditRemaining;
      type = 'credits';
    } else {
      cost = round(sd.minimumTemplateDuration);
      balance = round(sd.minutesRemainingInContract);
      type = 'minutes';
    }
    var balanceData = {
      insufficient: (!this.props.isPreview && cost > balance),
      sufficient: (!this.props.isPreview && cost <= balance)
    }
    var tCost;
    if (this.props.isPreview) {
      tCost = (
        <div className="amount no-cost">Free Preview</div>
      );
    } else {
      tCost = [
        <div key="1" className="amount">{cost}</div>,
        <div key="2" className="type">{type}</div>
      ];
    }
    return(
      <div className={cx('account-balance-component', 'component', {preview: this.props.isPreview})}>
        <div className="template-cost">
          <div className="label">Template Cost</div>
          {tCost}
        </div>
        <div className={cx('account-balance', balanceData)}>
          <div className="label">Account Balance</div>
          <div className="amount">{balance}</div>
          <div className="type">{type}</div>
        </div>
      </div>
    );
  }
});