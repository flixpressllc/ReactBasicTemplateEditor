import React from 'react';
import InputFilter from './hoc/InputFilter';
import cx from 'classnames';
import './TextField.scss';
import { registerDataType } from '../utils/globalContainerConcerns';
import * as ContainerActions from '../actions/ContainerActions';

const DATA_TYPE_NAME = 'textField';

registerDataType(DATA_TYPE_NAME);

const TextField = React.createClass({
  displayName: 'TextField',

  getDefaultProps: function () {
    return {
      value: ''
    };
  },

  handleTextEdit: function (e) {
    let newValue = this.props.filterInput(e.target.value);
    if (newValue !== this.props.value) {
      ContainerActions.changeContainer(
        DATA_TYPE_NAME,
        this.props.fieldName,
        {value: newValue}
      );
    }
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
          value={this.props.value}
          onChange={this.handleTextEdit}
          onFocus={this.handleFocus}
        />
      </div>
    )
  }
});

export default InputFilter(TextField);
