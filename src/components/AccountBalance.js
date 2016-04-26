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
    return(
      <div className={cx('account-balance-component', 'component', {preview: this.props.isPreview})}>
        <div className="template-cost">
          <div className="label">Template Cost</div>
          <div className="amount">{cost}</div>
          <div className="type">{type}</div>
        </div>
        <div className="account-balance">
          <div className="label">Account Balance</div>
          <div className="amount">{balance}</div>
          <div className="type">{type}</div>
        </div>
      </div>
    );
  }
});