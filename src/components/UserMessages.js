import React from 'react';
import cx from 'classnames';
import './UserMessages.scss';

var Message = React.createClass({
  raw: function (m) {
    return {__html: m};
  },
  
  render: function () {
    var className = 'reactBasicTemplateEditor-UserMessages-message user-message ' + this.props.type;
    // if (this.props.htmlSafe === true){
    //   return (
    //     <div
    //       className={className}
    //       dangerouslySetInnerHTML={this.raw(this.props.message)}
    //     />
    //   )
    // }
    
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
    var messagesObjArr = this.props.messages;
    var messages = [];

    for (var i = 0; i < messagesObjArr.length; i++) {
      var type = messagesObjArr[i].type;
      if (typeof this.props.typeOverride === 'string'){
        type = this.props.typeOverride;
      }
      messages.push(
        <Message key={i} message={messagesObjArr[i].message} htmlSafe={messagesObjArr[i].htmlSafe} type={type} />
      );
    }

    if (messages.length !== 0) {
      return (<div className={cx(this.props.className,'reactBasicTemplateEditor-UserMessages')}>{messages}</div>)
    } else {
      return (<div style={this.emptyStyle}></div>);
    }
  }
});
