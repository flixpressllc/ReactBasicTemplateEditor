import React from 'react';
import cx from 'classnames';

var Message = React.createClass({
  render: function () {
    return (
      <div className={className}>
        {this.props.message}
      </div>
    )
  }
});

export default React.createClass({
  emptyStyle: {display: 'none'},
  
  render: function () {
    var caughtErrorsArr = this.props.caughtErrors;
    var errors = [];

    for (var i = 0; i < caughtErrorsArr.length; i++) {
      errors.push(
        <Message key={i} message={caughtErrorsArr[i].message} type="error" />
      );
    }

    if (errors.length !== 0) {
      return (<div className={cx(this.props.className,'user-messages','component')}>{errors}</div>)
    } else {
      return (<div style={this.emptyStyle}></div>);
    }
  }
});
