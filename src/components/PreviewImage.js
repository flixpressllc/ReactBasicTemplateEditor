import React from 'react';
import {clone} from './imports';

export default React.createClass({
  getInitialState: function () {
    return {style: {backgroundSize: 'contain'}}
  },
  
  componentWillReceiveProps: function(newProps) {
    if (newProps.image != this.props.image && newProps.image !== '') {
      var style = clone(this.state.style);
      style.backgroundImage = `url("/templates/images/${newProps.image}")`;
      this.setState({style: style});
    }
  },
  
  render: function(){
    return (
      <div className="preview-image" style={this.state.style}></div>
    );
  }
});
