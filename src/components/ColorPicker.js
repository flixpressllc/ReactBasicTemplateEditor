import React from 'react';
import cx from 'classnames';
import { SketchPicker } from 'react-color';
import { Checkboard } from 'react-color/lib/components/common';
import reactCSS from 'reactcss';
import { registerDataType } from '../utils/globalContainerConcerns';
import * as ContainerActions from '../actions/ContainerActions';

import './ColorPicker.scss';

const DATA_TYPE_NAME = 'colorPicker';

registerDataType(DATA_TYPE_NAME);

class ColorPicker extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      displayColorPicker: false,
      allowsAlpha: this.containsAlpha(props.color)
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentWillReceiveProps (nextProps) {
    var containsAlpha = this.containsAlpha(nextProps.color);
    if (this.props.allowsAlpha !== containsAlpha) {
      this.setState({allowsAlpha: containsAlpha});
    }
  }

  containsAlpha (color) {
    return color.split('.').length === 4;
  }

  // expects a string like '100.93.45'
  // returns an object of those values, along with alpha, if not provided
  makeColor (rgbaString) {
    var rgbArr = rgbaString.split('.');
    var rgbObject = {
      r: rgbArr[0],
      g: rgbArr[1],
      b: rgbArr[2],
      a: rgbArr[3]/100 || rgbArr[3] || 1  // First fallback value allows for zero.
    }
    return rgbObject;
  }

  makeString (rgbObject) {
    var rgbString = `${rgbObject.r}.${rgbObject.g}.${rgbObject.b}`;
    if (this.state.allowsAlpha) {
      return rgbString + `.${Math.round(rgbObject.a * 100)}`
    }
    return rgbString;
  }

  color () {
    return this.makeColor(this.props.color)
  }

  handleClick () {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  }

  handleClose () {
    this.setState({ displayColorPicker: false });
  }

  handleColorChange (color){
    ContainerActions.changeContainer(
      DATA_TYPE_NAME,
      this.props.fieldName,
      {value: this.makeString(color.rgb)}
    );
  }

  render (){
    const color = this.color();
    const styles = reactCSS({
      'default': {
        color: {
          position: 'relative'
        },
        activeColor: {
          absolute: '0px 0px 0px 0px',
          borderRadius: '2px',
          background: 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.15), inset 0 0 4px rgba(0,0,0,.25)'
        },
        swatch: {
          cursor: 'pointer'
        },
        popover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
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
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }
      }
    });
    return(
      <div className={cx(this.props.className,'reactBasicTemplateEditor-ColorPicker')} style={styles.root}>
        <label htmlFor={this.props.fieldName}>
          {this.props.fieldName}
        </label>

        <div className='reactBasicTemplateEditor-ColorPicker-swatch' style={ styles.swatch } onClick={ this.handleClick }>
          <div className='reactBasicTemplateEditor-ColorPicker-swatchColor' style={ styles.color }>
            <Checkboard size={5} />
            <div style={ styles.activeColor }/>
          </div>
        </div>

        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose } />
          <div style={ styles.safeZone } >
            <SketchPicker
              disableAlpha={ !this.state.allowsAlpha }
              color={ color }
              presetColors={ this.presetColors }
              onChange={ this.handleColorChange } />
          </div>
        </div> : null }

      </div>
    );
  }
}

ColorPicker.defaultProps = {
  presetColors: [
    '#D0021B', '#F5A623', '#F8E71C',
    '#8B572A', '#7ED321', '#417505',
    '#BD10E0', '#9013FE', '#4A90E2',
    '#50E3C2', '#B8E986', '#000000',
    '#4A4A4A', '#9B9B9B', '#FFFFFF'
  ]
}

export default ColorPicker;
