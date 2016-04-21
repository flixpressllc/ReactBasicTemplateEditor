import React from 'react';
import {CheckBox} from './imports';

export default React.createClass({
  componentWillMount: function () {
    // Remove old submit button
    $('input[name="Submit_BT"]').remove();
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
