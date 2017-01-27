import React from 'react';
import cx from 'classnames';
import { registerDataType } from '../utils/globalContainerConcerns';

import './TextBox.scss';

registerDataType('textBox', {containerName: 'textBoxes'});

export default React.createClass({
  handleTextEdit: function(event){
    this.props.onUserInput(
      this.props.fieldName,
      event.target.value
    );
  },

  handleFocus: function () {
    this.props.onTextBoxFocus(this.props.fieldName);
  },

  render: function(){
    return(
      <div className={cx(this.props.className,'reactBasicTemplateEditor-TextBox')}>
        <label htmlFor={this.props.fieldName}>
          {this.props.fieldName}
        </label>
        <textarea
          name={this.props.fieldName}
          value={this.props.userText}
          onChange={this.handleTextEdit}
          onFocus={this.handleFocus}
        />
      </div>
    )
  }
});
