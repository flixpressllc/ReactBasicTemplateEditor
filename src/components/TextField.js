import React from 'react';
import InputFilter from './hoc/InputFilter';
import cx from 'classnames';
import './TextField.scss';
import { registerDataType } from '../utils/globalContainerConcerns';
import * as ContainerActions from '../actions/ContainerActions';

const DATA_TYPE_NAME = 'textField';

registerDataType(DATA_TYPE_NAME);

class TextField extends React.Component {
  constructor (props) {
    super(props);
    this.handleTextEdit = this.handleTextEdit.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
  }

  handleTextEdit (e) {
    let newValue = this.props.filterInput(e.target.value);
    if (newValue !== this.props.value) {
      ContainerActions.changeContainer(
        DATA_TYPE_NAME,
        this.props.fieldName,
        {value: newValue}
      );
    }
  }

  handleFocus () {
    this.props.onTextFieldFocus(this.props.fieldName);
  }

  render () {
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
}

TextField.defaultProps = { value: '' };

export default InputFilter(TextField);
