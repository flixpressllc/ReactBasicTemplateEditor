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
  displayName: 'AccountBalance',
  render: function () {
    var sd = this.props.userSettingsData;

    // .NET normalize
    var isChargePerOrder = sd.isChargePerOrder;

    var cost, balance, rawCost, rawBalance;
    if (isChargePerOrder) {
      rawCost = sd.renderCost;
      cost = '$' + rawCost;
      balance = rawBalance = sd.creditRemaining;
    } else {
      rawCost = round(sd.minimumTemplateDuration);
      rawBalance = round(sd.minutesRemainingInContract);
      cost = minToTime(rawCost);
      balance = minToTime(rawBalance);
    }

    var balanceData = {
      insufficient: (!this.props.isPreview && rawCost > rawBalance),
      sufficient: (!this.props.isPreview && rawCost <= rawBalance)
    }

    var costView = this.props.isPreview ? 'Free Preview' : cost;
    var tCostClassName = cx('reactBasicTemplateEditor-AccountBalance-costAmount', {free: this.props.isPreview})
    var tCost = <div className={tCostClassName} >{costView}</div>;

    var accountBalanceDisplay;
    if (isChargePerOrder){
      accountBalanceDisplay = [];
    } else {
      accountBalanceDisplay = (
        <div className={cx('reactBasicTemplateEditor-AccountBalance-balance', balanceData)}>
          <div className="reactBasicTemplateEditor-AccountBalance-balanceLabel">Account Balance</div>
          <div className="reactBasicTemplateEditor-AccountBalance-balanceAmount">{balance}</div>
        </div>
      );
    }
    return(
      <div className={cx('reactBasicTemplateEditor-AccountBalance', {preview: this.props.isPreview, 'is-payg-user': isChargePerOrder})}>
        <div className="reactBasicTemplateEditor-AccountBalance-cost">
          <div className="reactBasicTemplateEditor-AccountBalance-costLabel">Template Cost</div>
          {tCost}
        </div>
        {accountBalanceDisplay}
      </div>
    );
  }
});
