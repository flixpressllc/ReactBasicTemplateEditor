import React from 'react';
import { registerDataType } from '../utils/globalContainerConcerns';

import './DropDown.scss';

registerDataType('dropDown');

export default React.createClass({
  onDropDownChange: function () {
    this.props.onDropDownChange(this.mountedInstance, this.props.fieldName);
    this.props.onDropDownFocus(this.props.fieldName);
  },

  onMount: function (ref) {
    this.mountedInstance = ref;
    // if there is no value chosen for the dropdown yet...
    if (this.props.value === undefined) {
      // ...tell props that we've chosen the default to start
      this.props.onDropDownChange(ref, this.props.fieldName);
    }
  },

  render: function(){
    let name = this.props.fieldName;
    var options = [];
    var theDefault = this.props.default;
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
          ref={this.onMount}
          onChange={ (obj) => this.onDropDownChange(obj) }
          onFocus={ () => this.props.onDropDownFocus(this.props.fieldName) }
          defaultValue={ theDefault }
          value={ this.props.value }
        >
         { options }
        </select>
      </div>
    )
  }
});
