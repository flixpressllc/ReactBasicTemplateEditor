import React from 'react';
import PT from 'prop-types';
import cx from 'classnames';

const CheckBox = (props) => {
  return (
    <label className={cx('reactBasicTemplateEditor-CheckBox-label', props.className)}>
      <input className="reactBasicTemplateEditor-CheckBox-input"
        type="checkbox" disabled={props.disabled}
        checked={props.checked} onChange={props.onChange}/>
        {props.children}
    </label>
  );
};

CheckBox.propTypes = {
  onChange: PT.func,
  disabled: PT.bool,
  checked: PT.bool,
  className: PT.string
};

export default CheckBox
