import React from 'react';
import cx from 'classnames';
import { SketchPicker } from 'react-color';
import { Checkboard } from 'react-color/lib/components/common';
import reactCSS from 'reactcss';

var ColorPicker = React.createClass({
  getInitialState: function () {
    return {
      displayColorPicker: false,
      allowsAlpha: this.containsAlpha(this.props.color)
    };
  },

  componentWillReceiveProps: function (nextProps) {
    var containsAlpha = this.containsAlpha(nextProps.color);
    if (this.props.allowsAlpha !== containsAlpha) {
      this.setState({allowsAlpha: containsAlpha});
    }
  },

  containsAlpha: function (color) {
    return color.split('.').length === 4;
  },

  // expects a string like '100.93.45'
  // returns an object of those values, along with alpha, if not provided
  makeColor: function (rgbaString) {
    var rgbArr = rgbaString.split('.');
    var rgbObject = {
      r: rgbArr[0],
      g: rgbArr[1],
      b: rgbArr[2],
      a: rgbArr[3]/100 || 1
    }
    return rgbObject;
  },

  makeString: function (rgbObject) {
    var rgbString = `${rgbObject.r}.${rgbObject.g}.${rgbObject.b}`;
    if (this.state.allowsAlpha) {
      return rgbString + `.${Math.round(rgbObject.a * 100)}`
    }
    return rgbString;
  },

  color: function () {
    return this.makeColor(this.props.color)
  },

  handleClick: function () {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  },

  handleClose: function () {
    this.setState({ displayColorPicker: false });
  },

  handleColorChange: function(color){
    this.props.onColorChange(
      this.props.fieldName,
      this.makeString(color.rgb)
    );
  },
  
  render: function(){
    const color = this.color();
    const styles = reactCSS({
      'default': {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ color.a })`,
          position: 'relative'
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer'
        },
        popover: {
          position: 'absolute',
          zIndex: '2'
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px'
        },
        safeZone: {
          zIndex: '3',
          position: 'relative'
        }
      }
    });
    return(
      <div className={cx(this.props.className,'text-box','component')} style={styles.root}>
        <label htmlFor={this.props.fieldName}>
          {this.props.fieldName}
        </label>
        
        <div>
          <div style={ styles.swatch } onClick={ this.handleClick }>
            <div style={ styles.color }>
              <Checkboard size={5} />
            </div>
          </div>
          { this.state.displayColorPicker ? <div style={ styles.popover }>
            <div style={ styles.cover } onClick={ this.handleClose } />
            <div style={ styles.safeZone } >
              <SketchPicker
                disableAlpha={ !this.state.allowsAlpha }
                color={ color }
                onChange={ this.handleColorChange } />
            </div>
          </div> : null }

        </div>
      </div>
    );
  }
});

export default ColorPicker;
