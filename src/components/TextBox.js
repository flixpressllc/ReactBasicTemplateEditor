import React from 'react';
import InputFilter from './hoc/InputFilter';
import TextArea from 'react-textarea-autosize';
import cx from 'classnames';
import { registerDataType } from '../utils/globalContainerConcerns';
import * as ContainerActions from '../actions/ContainerActions';

import './TextBox.scss';

const DATA_TYPE_NAME = 'textBox';

registerDataType(DATA_TYPE_NAME, {containerName: 'textBoxes'});

class TextBox extends React.Component {
  constructor (props) {
    super(props);
    this.handleTextEdit = this.handleTextEdit.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
  }

  handleTextEdit (e) {
    let newValue = this.props.filterInput(e.target.value);
    ContainerActions.changeContainer(
      DATA_TYPE_NAME,
      this.props.fieldName,
      {value: newValue}
    );
  }

  handleFocus () {
    this.props.onTextBoxFocus(this.props.fieldName);
  }

  render () {
    return(
      <div className={cx(this.props.className,'reactBasicTemplateEditor-TextBox')}>
        <label htmlFor={this.props.fieldName}>
          {this.props.fieldName}
        </label>
        <TextArea
          name={this.props.fieldName}
          value={this.props.userText}
          onChange={this.handleTextEdit}
          onFocus={this.handleFocus}
        />
      </div>
    )
  }
}

TextBox.defaultProps = { value: '' };

export default InputFilter(TextBox);
