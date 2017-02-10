import React from 'react';
import cx from 'classnames';
import './TextField.scss';
import { registerDataType } from '../utils/globalContainerConcerns';

registerDataType('textField');

export default React.createClass({
  displayName: 'TextField',
  handleTextEdit: function(event){
    let newValue = this.filterChange(event.target.value);
    if (newValue !== this.props.settings.value) {
      this.props.onUserInput(
        this.props.fieldName,
        newValue
      );
    }
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
    this.props.onTextFieldFocus(this.props.fieldName);
  },

  render: function(){
    return(
      <div className={cx(this.props.className,'reactBasicTemplateEditor-TextField')}>
        <label htmlFor={this.props.fieldName}>
          {this.props.fieldName}
        </label>
        <input
          type="text"
          name={this.props.fieldName}
          value={this.props.settings.value}
          onChange={this.handleTextEdit}
          onFocus={this.handleFocus}
        />
      </div>
    )
  }
});
