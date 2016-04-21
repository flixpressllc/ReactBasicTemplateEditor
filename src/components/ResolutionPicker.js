import React from 'react';
import {RadioGroup} from './imports';

export default React.createClass({
  handleResolutionChange: function (value) {
    this.props.resolutionIdChange(parseInt(value,10));
  },
  render: function () {
    var resolutionOptions = this.props.resolutionOptions;
    if (resolutionOptions === undefined){
      resolutionOptions = [];
    }
    var checked = this.props.chosen.toString();
    var options = resolutionOptions.map(function (resObj){
      return {
        id: resObj.id.toString(),
        name: resObj.name
      };
    })
    return (
      <div className="resolution-picker-component component">
        <h3>Resolution Options</h3>
        Choose the resoution for your final order.
        <div className="explain">
          Previews always render at 360p with a watermark.
        </div>
        <RadioGroup
          options={options}
          value={checked}
          valueName="id"
          labelName="name"
          onChange={this.handleResolutionChange}
        />
      </div>
    );
  }
});
