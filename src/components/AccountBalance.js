import React from 'react';
import cx from 'classnames';
import {round} from 'happy-helpers';
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

const AccountBalance = (props) => {

  var sd = props.userSettingsData;

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
    insufficient: (!props.isPreview && rawCost > rawBalance),
    sufficient: (!props.isPreview && rawCost <= rawBalance)
  }

  var costView = props.isPreview ? 'Free Preview' : cost;
  var tCostClassName = cx('reactBasicTemplateEditor-AccountBalance-costAmount', {free: props.isPreview})
  var tCost = <div className={ tCostClassName }>{ costView }</div>;
  var costLabel = isChargePerOrder ? 'Template Cost' : 'Template Duration';

  var accountBalanceDisplay;
  if (isChargePerOrder){
    accountBalanceDisplay = [];
  } else {
    accountBalanceDisplay = (
      <div className={cx('reactBasicTemplateEditor-AccountBalance-balance', balanceData)}>
        <div className="reactBasicTemplateEditor-AccountBalance-balanceLabel">Account Balance</div>
        <div className="reactBasicTemplateEditor-AccountBalance-balanceAmount">{ balance }</div>
      </div>
    );
  }
  return(
    <div className={cx('reactBasicTemplateEditor-AccountBalance', {preview: props.isPreview, 'is-payg-user': isChargePerOrder})}>
      <div className="reactBasicTemplateEditor-AccountBalance-cost">
        <div className="reactBasicTemplateEditor-AccountBalance-costLabel">{ costLabel }</div>
        { tCost }
      </div>
      { accountBalanceDisplay }
    </div>
  );
}

export default AccountBalance;
