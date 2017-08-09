import React from 'react';
import { registerDataType } from '../utils/globalContainerConcerns';
import * as ContainerActions from '../actions/ContainerActions';

import './DropDown.scss';

const DATA_TYPE_NAME = 'dropDown'

registerDataType(DATA_TYPE_NAME);

class DropDown extends React.Component {
  constructor (props) {
    super(props);
    this.handleDropDownChange = this.handleDropDownChange.bind(this);
    // Allow override of classname when extended
    this.className = 'reactBasicTemplateEditor-DropDown';
  }

  handleDropDownChange (e) {
    ContainerActions.changeContainer(DATA_TYPE_NAME, this.props.fieldName, {value: e.target.value});
    setTimeout(() => this.props.onDropDownFocus(this.props.fieldName), 100); // TODO: fix this hack
  }

  render () {
    let name = this.props.fieldName;
    var options = [];
    var safeName = name.replace(' ','-');

    for (var i = 0; i < this.props.options.length; i++) {
      var option = this.props.options[i]
      options.push(
        <option
          key={`${safeName}-option-${option.value}`}
          value={option.value}
        >
          {option.name}
        </option>
      )
    }

    return (
      <div className={ this.className }>
        <label>{name}</label>
        <select
          onChange={ this.handleDropDownChange }
          onFocus={ () => this.props.onDropDownFocus(this.props.fieldName) }
          defaultValue={ this.props.defaultValue }
          value={ this.props.value }
        >
         { options }
        </select>
      </div>
    )
  }
}

DropDown.defaultProps = {
  options: [],
  fieldName: '',
  onDropDownFocus: () => {
    throw new Error('DropDown was not given an `onDropDownFocus` function');
  }
};

export default DropDown;
