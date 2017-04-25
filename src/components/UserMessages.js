import React from 'react';
import cx from 'classnames';
import './UserMessages.scss';

const Message = (props) => {
  var className = 'reactBasicTemplateEditor-UserMessages-message user-message ' + props.type;
  return (
    <div className={className}>
      {props.message}
    </div>
  )
};

const UserMessages = (props) => {
  var messagesObjArr = props.messages;
  var messages = [];

  for (var i = 0; i < messagesObjArr.length; i++) {
    var type = messagesObjArr[i].type;
    if (typeof props.typeOverride === 'string'){
      type = props.typeOverride;
    }
    messages.push(
      <Message key={i} message={messagesObjArr[i].message} htmlSafe={messagesObjArr[i].htmlSafe} type={type} />
    );
  }

  if (messages.length !== 0) {
    return (<div className={cx(props.className,'reactBasicTemplateEditor-UserMessages')}>{messages}</div>)
  } else {
    return null;
  }
};

export default UserMessages;
