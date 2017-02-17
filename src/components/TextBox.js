import React from 'react';
import cx from 'classnames';
import { registerDataType } from '../utils/globalContainerConcerns';
import * as ContainerActions from '../actions/ContainerActions';

import './TextBox.scss';

const DATA_TYPE_NAME = 'textBox';

registerDataType(DATA_TYPE_NAME, {containerName: 'textBoxes'});

export default React.createClass({
  displayName: 'TextBox',
  handleTextEdit: function(e){
    ContainerActions.changeContainer(
      DATA_TYPE_NAME,
      this.props.fieldName,
      {value: e.target.value}
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
