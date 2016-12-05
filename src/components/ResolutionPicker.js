import React from 'react';
import {RadioGroup} from './imports';
import './ResolutionPicker.scss';

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
      <div className="reactBasicTemplateEditor-ResolutionPicker">
        <h3 className="reactBasicTemplateEditor-ResolutionPicker-title">Resolution Options</h3>
        Choose the resoution for your final order.
        <div className="reactBasicTemplateEditor-ResolutionPicker-explain">
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
