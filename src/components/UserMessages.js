import React from 'react';

var styles = {
 messages: {
    error: {
      color: 'red'
    }
  }
}

var Message = React.createClass({
  render: function () {
    return (
      <div style={styles.messages[this.props.type]}>
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
      return (<div className="user-messages">{errors}</div>)
    } else {
      return (<div style={this.emptyStyle}></div>);
    }
  }
});
