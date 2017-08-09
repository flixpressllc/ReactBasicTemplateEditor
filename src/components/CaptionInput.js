import React from 'react';
import InputFilter from './hoc/InputFilter';

function CaptionInput (props) {
  function handleChange (e) {
    props.onChange(props.filterInput(e.target.value), props['data-index']);
  }
  return (
    <input className='reactBasicTemplateEditor-CaptionInput'
      type='text'
      data-index={ props['data-index'] }
      value={ props.value }
      placeholder={ props.label }
      onChange={ handleChange }
      />
  )
}

export default InputFilter(CaptionInput);
