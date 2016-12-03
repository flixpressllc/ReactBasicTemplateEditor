import React from 'react';
import cx from 'classnames';
import {round} from '../utils/helper-functions';
import './AccountBalance.scss';

const minToTime = function (min) {
  var sec_num = Math.floor(min * 60);
  var hours   = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours > 0) {hours = hours + 'hr ';} else {hours = '';}
  if (hours > 0 && minutes < 10 && minutes > 0) {minutes = '0'+minutes;}
  if (minutes > 0) {minutes = minutes + 'min ';} else {minutes = '';}
  if (seconds < 10) {seconds = '0'+seconds;}
  if (seconds > 0) {seconds += 'sec';}
  var time    = hours + minutes + seconds;
  return time;
};

export default React.createClass({
  render: function () {
    var sd = this.props.userSettingsData;
    
    // .NET normalize
    var isChargePerOrder = (sd.isChargePerOrder === true || sd.isChargePerOrder === 'True') ? true : false;
    
    var cost, balance, rawCost, rawBalance, type;
    if (isChargePerOrder) {
      rawCost = sd.renderCost;
      cost = '$' + rawCost;
      balance = rawBalance = sd.creditRemaining;
      type = '(USD)';
    } else {
      rawCost = round(sd.minimumTemplateDuration);
      rawBalance = round(sd.minutesRemainingInContract);
      cost = minToTime(rawCost);
      balance = minToTime(rawBalance);
      type = 'monthly time';
    }
    
    var balanceData = {
      insufficient: (!this.props.isPreview && rawCost > rawBalance),
      sufficient: (!this.props.isPreview && rawCost <= rawBalance)
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
    var accountBalanceDisplay;
    if (isChargePerOrder){
      accountBalanceDisplay = [];
    } else {
      accountBalanceDisplay = (
        <div className={cx('reactBasicTemplateEditor-AccountBalance-accountBalance', balanceData)}>
          <div className="label">Account Balance</div>
          <div className="amount">{balance}</div>
          <div className="type">{type}</div>
        </div>
      );
    }
    return(
      <div className={cx('reactBasicTemplateEditor-AccountBalance', {preview: this.props.isPreview, 'is-payg-user': isChargePerOrder})}>
        <div className="template-cost">
          <div className="label">Template Cost</div>
          {tCost}
        </div>
        {accountBalanceDisplay}
      </div>
    );
  }
});
