import React from 'react';
import cx from 'classnames';
import { SketchPicker } from 'react-color';
import reactCSS from 'reactcss';

var ColorPicker = React.createClass({
  // handleColorChange: function(color){
  //   var rgbString = `${color.rgb.r}.${color.rgb.g}.${color.rgb.b}`
  //   this.props.onColorChange(
  //     this.props.fieldName,
  //     rgbString
  //   );
  // },
  
  getInitialState: function () {
    // this.makeColor(this.props.color);
    return {
      displayColorPicker: false,
      color: {
        r: '241',
        g: '112',
        b: '19',
        a: '1'
      }
    };
  },

  // componentWillReceiveProps: function (nextProps) {
  //   // we are only concerned with color changes here, for now
  //   if (nextProps.color === this.props.color) return;
  //   this.makeColor(nextProps.color);
  // },

  makeColor: function (color) {
    var defaults = {
      r: '241',
      g: '112',
      b: '19',
      a: '1'
    };
    this.color = Object.assign({}, defaults, color);
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
            <SketchPicker
              disableAlpha={true}
              color={ this.state.color }
              onChange={ this.handleColorChange } />
          </div> : null }

        </div>
      </div>
    );
  }
});

export default ColorPicker;
