import 'core-js/fn/object/assign';
import React from 'react';

/// From https://github.com/jerryshew/react-component/blob/master/component/Radio.js
class RadioButton extends React.Component {
  constructor (props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e){
    const {value, onChange} = this.props;
    if(onChange) onChange(e, value);
  }

  render() {
    let {className, checked, disabled, style, children} = this.props;
    if (disabled) className = `${className} _disabled`;
    return (
      <label style={style} className={`ui radio ${className}`}>
        <input type="radio" ref="radioInput" disabled={disabled} checked={checked} onChange={this.handleChange} />
        {children}
      </label>
    );
  }
}

RadioButton.propTypes = {
  onChange: React.PropTypes.func,
  checked: React.PropTypes.bool,
  disabled: React.PropTypes.bool,
  value: React.PropTypes.string,
  className: React.PropTypes.string
};

RadioButton.defaultProps = {
  className: ''
}



/// From https://github.com/jerryshew/react-component/blob/master/component/RadioGroup.js
class RadioGroup extends React.Component {
  constructor (props) {
    super(props);
    const {options, value} = props;
    this.state = { options, value };

    this.handleToggleChange = this.handleToggleChange.bind(this);
  }

  handleToggleChange(e, value){
    this.setState({ value }, () => {
      if (this.props.onChange) this.props.onChange(this.state.value);
    });
  }

  componentDidMount() {
    const {defaultChecked, valueName} = this.props;
    const {value, options} = this.state;
    if (defaultChecked && !value && options.length > 0){
      this.setState({
        value: options[0][valueName]
      });
    }
  }

  render() {
    const {labelName, valueName, className, style, children} = this.props;
    // Don: I changed this line. It wouldn't refresh on new props...
    const {value, options} = this.props;
    let optionNodes = [], itemChecked;

    if (children) {
      React.Children.map(children, (node, i) => {
        itemChecked = node.props.value === value;
        optionNodes.push(
          <RadioButton
            key={i}
            checked={itemChecked}
            {...node.props}
            disabled={this.props.disabled}
            onChange={this.handleToggleChange}>
          </RadioButton>
        );
      })
    } else {
      options.map(item => {
        itemChecked = item[valueName] === value;
        optionNodes.push(
          <RadioButton key={item[valueName]}
            value={item[valueName]}
            checked={itemChecked}
            disabled={this.props.disabled}
            onChange={this.handleToggleChange}>
            {item[labelName]}
          </RadioButton>
        );
      });
    }

    return (
      <div style={style} className={className}>
        {optionNodes}
      </div>
    );
  }
}

RadioGroup.propTypes = {
  options: React.PropTypes.array,
  value: React.PropTypes.string,
  labelName: React.PropTypes.string,
  valueName: React.PropTypes.string,
  onChange: React.PropTypes.func,
  defaultChecked: React.PropTypes.bool
}

RadioGroup.defaultProps = {
  labelName: 'name',
  valueName: 'value',
  options: []
}

export default RadioGroup;
