import React from 'react';
import {clone} from './imports';
import {styles} from '../styles/styles.js';

export default React.createClass({
  getInitialState: function () {
    return {style: styles.previewImage}
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
      <div style={this.state.style}></div>
    );
  }
});
