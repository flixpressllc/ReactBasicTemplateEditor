import React from 'react';
import cx from 'classnames';
import { registerDataType } from '../utils/globalContainerConcerns';
import * as ContainerActions from '../actions/ContainerActions';

import './TextBox.scss';

const DATA_TYPE_NAME = 'textBox';

registerDataType(DATA_TYPE_NAME, {containerName: 'textBoxes'});

export default React.createClass({
  displayName: 'TextBox',

  getDefaultProps: function () {
    return {
      value: '',
      settings: {}
    };
  },

  handleTextEdit: function (e) {
    let newValue = this.filterChange(e.target.value);
    ContainerActions.changeContainer(
      DATA_TYPE_NAME,
      this.props.fieldName,
      {value: newValue}
    );
  },

  filterChange: function (newValue) {
    return this.characterLimit(newValue);
  },

  characterLimit: function (string) {
    let limit = this.props.settings.maxCharacters;
    if (!limit || limit <= 0) return string;
    if (limit === 1) {
      return string.charAt(string.length - 1);
    }
    return string.slice(0, this.props.settings.maxCharacters);
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
