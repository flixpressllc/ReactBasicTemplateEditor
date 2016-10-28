import React from 'react';
import cx from 'classnames';
import { SketchPicker } from 'react-color';
import reactCSS from 'reactcss';

var ColorPicker = React.createClass({
  getInitialState: function () {
    return {
      displayColorPicker: false,
      color: this.makeColor(this.props.color)
    };
  },

  // componentWillReceiveProps: function (nextProps) {
  //   // we are only concerned with color changes here, for now
  //   if (nextProps.color === this.props.color) return;
  //   this.makeColor(nextProps.color);
  // },

  // expects a string like '100.93.45'
  // returns an object of those values, along with alpha, if not provided
  makeColor: function (rgbaString) {
    var rgbArr = rgbaString.split('.');
    var rgbObject = {
      r: rgbArr[0],
      g: rgbArr[1],
      b: rgbArr[2],
      a: rgbArr[3] || 1
    }
    return rgbObject;
  },

  makeString: function (rgbObject) {

  },

  color: {}, // will receive from props

  handleClick: function () {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  },

  handleClose: function () {
    this.setState({ displayColorPicker: false })
  },

  handleColorChange: function (color) {
    this.setState({ color: color.rgb })
  },

  // handleColorChange: function(color){
  //   var rgbString = `${color.rgb.r}.${color.rgb.g}.${color.rgb.b}`
  //   this.props.onColorChange(
  //     this.props.fieldName,
  //     rgbString
  //   );
  // },
  
  render: function(){
    const styles = reactCSS({
      'default': {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b }, ${ this.state.color.a })`
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
          position: 'relative',
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
            <div style={ styles.color } />
          </div>
          { this.state.displayColorPicker ? <div style={ styles.popover }>
            <div style={ styles.cover } onClick={ this.handleClose } />
            <div style={ styles.safeZone } >
              <SketchPicker
                disableAlpha={true}
                color={ this.state.color }
                onChange={ this.handleColorChange } />
            </div>
          </div> : null }

        </div>
      </div>
    );
  }
});

export default ColorPicker;
