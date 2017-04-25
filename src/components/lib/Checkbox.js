import React from 'react';
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
  onChange: React.PropTypes.func,
  disabled: React.PropTypes.bool,
  checked: React.PropTypes.bool,
  className: React.PropTypes.string
};

export default CheckBox
