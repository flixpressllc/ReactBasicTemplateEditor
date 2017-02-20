import React, { Component } from 'react';
import './LoadingSpinner.scss';

class LoadingSpinner extends Component {

  render(){
    let spinner;
    if (!!this.props.active) {
      spinner = <svg className='reactBasicTemplateEditor-LoadingSpinner-spinner' viewBox="0 0 239.34 239">
        <g className="reactBasicTemplateEditor-LoadingSpinner-spinnerPartPlayButton" data-name="Play Symbol">
          <path d="M640.11,455.42a55.06,55.06,0,1,1,55.14-55.06A55.17,55.17,0,0,1,640.11,455.42Z" transform="translate(-520.5 -280.5)"/>
          <path className="reactBasicTemplateEditor-LoadingSpinner-spinnerPartPlayButtonTriangle" d="M623.75,382.74V418a4.53,4.53,0,0,0,6.71,4l31.6-17.35a4.52,4.52,0,0,0,.05-7.89l-31.6-17.92A4.53,4.53,0,0,0,623.75,382.74Z" transform="translate(-520.5 -280.5)"/>
        </g>
        <g className="reactBasicTemplateEditor-LoadingSpinner-spinnerPartGear">
          <g>
            <path d="M639.91,489a88.46,88.46,0,1,1,88.59-88.46A88.63,88.63,0,0,1,639.91,489Zm0-161.37a72.9,72.9,0,1,0,73,72.9A73,73,0,0,0,639.91,327.61Z" transform="translate(-520.5 -280.5)"/>
            <path d="M618.15,318.78l6.73-38.28h29.53l7.25,38.8Z" transform="translate(-520.5 -280.5)"/>
            <path d="M682.65,327.37l31.87-22.31,20.88,20.85-22.35,32.56Z" transform="translate(-520.5 -280.5)"/>
            <path d="M721.5,378.53l38.34,6.73v29.49L721,422Z" transform="translate(-520.5 -280.5)"/>
            <path d="M712.9,442.42l22.35,31.82-20.88,20.85-32.6-22.31Z" transform="translate(-520.5 -280.5)"/>
            <path d="M661.67,481.22l-6.73,38.28H625.41l-7.25-38.8Z" transform="translate(-520.5 -280.5)"/>
            <path d="M597.69,472.63l-31.87,22.31-20.88-20.85,22.35-32.56Z" transform="translate(-520.5 -280.5)"/>
            <path d="M520.5,385.77l38.85-7.24L558.84,422l-38.34-6.73" transform="translate(-520.5 -280.5)"/>
            <path d="M567.44,358.1,545.1,326.28,566,305.43l32.6,22.31Z" transform="translate(-520.5 -280.5)"/>
          </g>
        </g>
      </svg>;

    } else {
      spinner = null;
    }

    return (
      <div className='reactBasicTemplateEditor-LoadingSpinner'>
        { spinner }
      </div>
    );
  }
}

LoadingSpinner.defaultProps = {
  active: true
}

export default LoadingSpinner;
