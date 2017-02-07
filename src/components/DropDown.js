import React from 'react';
import { registerDataType } from '../utils/globalContainerConcerns';

import './DropDown.scss';

registerDataType('dropDown');

export default React.createClass({
  getDefaultProps: function () {
    return {
      options: [],
      fieldName: '',
      onDropDownChange: () => {
        throw new Error('DropDown was not given an `onDropDownChange` function');
      },
      onDropDownFocus: () => {
        throw new Error('DropDown was not given an `onDropDownFocus` function');
      }
    };
  },

  handleDropDownChange: function (e) {
    this.props.onDropDownChange(e, this.props.fieldName,
    ()=> {
      // This will update PreviewImage... should find a better way...
      this.props.onDropDownFocus(this.props.fieldName);
    });
  },

  render: function(){
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
      <div className="reactBasicTemplateEditor-DropDown">
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
});
