import React from 'react';
import cx from 'classnames';

export default React.createClass({
  handleTextEdit: function(event){
    this.props.onUserInput(
      this.props.fieldName,
      event.target.value
    );
  },
  
  handleFocus: function () {
    this.props.onTextFieldFocus(this.props.fieldName);
  },
  
  render: function(){
    return(
      <div className={cx(this.props.className,'text-field','component')}>
        <label htmlFor={this.props.fieldName}>
          {this.props.fieldName}:
        </label>
        <input
          type="text"
          name={this.props.fieldName}
          value={this.props.userText}
          onChange={this.handleTextEdit}
          onFocus={this.handleFocus}
        />
      </div>
    )
  }
});
