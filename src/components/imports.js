import 'core-js/fn/object/assign';
import React from 'react';
import ReactDOM from 'react-dom';

function clone(obj) {
  var target = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      target[i] = obj[i];
    }
  }
  return target;
}


/// From https://github.com/jerryshew/react-component/blob/master/component/CheckBox.js
const CheckBox = React.createClass({
    propTypes: {
        onChange: React.PropTypes.func,
        disabled: React.PropTypes.bool,
        checked: React.PropTypes.bool,
        className: React.PropTypes.string,
    },
    getInitialState() {
        return {
            checked:this.props.checked, 
        };
    },

    getDefaultProps() {
        return {
            className: '',
        };
    },

    checkedChange(e){
        const {onChange, value} = this.props;
        this.setState({
            checked: e.target.checked
        });
        if(onChange) onChange(e, value);
    },

    render() {
        let {disabled, style, className, children} = this.props;
        if (disabled) className = `${className} _disabled`;
        const {checked} = this.props;
        return ( 
            <label style={style} className={`ui checkbox ${className}`}>
                <input type="checkbox" disabled={disabled} 
                    checked={checked} onChange={this.checkedChange}/>
                {children}
            </label>
        );
    }
});

/// From https://github.com/jerryshew/react-component/blob/master/component/Radio.js
const Radio = React.createClass({
    propTypes: {
        onChange: React.PropTypes.func,
        checked: React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        value: React.PropTypes.string,
        className: React.PropTypes.string,
    },

    getDefaultProps() {
        return {
            className: '',
        };
    },

    checkedChange(e){
        const {value, onChange} = this.props;
        if(onChange) onChange(e, value);
    },

    render() {
        let {className, checked, disabled, style, children} = this.props;
        if (disabled) className = `${className} _disabled`;
        return (
            <label style={style} className={`ui radio ${className}`}>
                <input type="radio" ref="radioInput" disabled={disabled} checked={checked} onChange={this.checkedChange} />
                {children}
            </label>
        );
    }
});


/// From https://github.com/jerryshew/react-component/blob/master/component/RadioGroup.js
const RadioGroup = React.createClass({
    propTypes: {
        options: React.PropTypes.array,
        value: React.PropTypes.string,
        labelName: React.PropTypes.string,
        valueName: React.PropTypes.string,
        onChange: React.PropTypes.func,
        defaultChecked: React.PropTypes.bool,
    },
    getInitialState() {
        const {options, value} = this.props;
        return { options, value };
    },

    getDefaultProps() {
        return {
            labelName: 'name',
            valueName: 'value',
            options: [],
        };
    },
    
    toggleChange(e, value){
        this.setState({ value }, () => {
            if (this.props.onChange) this.props.onChange(this.state.value);
        });
    },

    componentDidMount() {
        const {defaultChecked, valueName} = this.props;
        const {value, options} = this.state;
        if (defaultChecked && !value && options.length > 0){
            this.setState({
                value: options[0][valueName] 
            });
        };
    },

    render() {
        const {labelName, valueName, className, style, children} = this.props;
        // Don: I changed this line. It wouldn't refresh on new props...
        const {value, options} = this.props;
        let optionNodes = [], itemChecked;

        if (children) {
            React.Children.map(children, (node, i) => {
                itemChecked = node.props.value === value;
                optionNodes.push(
                    <Radio
                        key={i}
                        checked={itemChecked}
                        {...node.props}
                        disabled={this.props.disabled}
                        onChange={this.toggleChange}>
                    </Radio>);
            })
        } else {
            for (let item of options){
                itemChecked = item[valueName] === value;
                optionNodes.push(
                    <Radio key={item[valueName]}
                        value={item[valueName]}
                        checked={itemChecked}
                        disabled={this.props.disabled}
                        onChange={this.toggleChange}>
                            {item[labelName]}
                    </Radio>
                );
            }
        }


        return (
            <div style={style} className={className}>
                {optionNodes}
            </div>
        );
    }
});


var flixpressLocation = false;
var promiseFlixpress = $.Deferred();
if (window.Flixpress) {
  flixpressLocation = window;
  promiseFlixpress.resolve(flixpressLocation.Flixpress)
} else if (window.parent.Flixpress) {
  flixpressLocation = window.parent;
  promiseFlixpress.resolve(flixpressLocation.Flixpress);
} else {
  $.getScript('/Scripts/flixpress-js/flixpress.js').done(function() {
    flixpressLocation = window;
    promiseFlixpress.resolve(flixpressLocation.Flixpress);
  });
}


export {clone, RadioGroup, CheckBox, promiseFlixpress};