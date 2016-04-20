import React from 'react';

export default React.createClass({
  componentWillMount: function () {
    // Remove old submit button
    $('input[name="Submit_BT"]').remove();
  },
  render: function () {
    var text = (this.props.isPreview) ? 'Render Preview' : 'Submit Order'
    return (
      <input name="Submit_BT" value={text} type="submit" id="Submit_BT" />
    )
  }
});
