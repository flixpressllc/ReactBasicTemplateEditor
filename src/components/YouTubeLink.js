import React from 'react';
import cx from 'classnames';
import { YOU_TUBE_API_KEY } from '../stores/app-settings';

export default React.createClass({
  handleTextEdit: function(event){
    this.props.onUserInput(
      this.props.fieldName,
      event.target.value
    );
  },
  
  handleFocus: function () {
    this.props.onTextFieldFocus(this.props.fieldName);
  },

  getInitialState: function () {
    return {
      linkIsValid: false,
      linkWasChecked: false,
    };
  },


  checkForValidity: function () {
    // check for validity here...
    var checkLink = `https://www.googleapis.com/youtube/v3/videos?part=id&id=${ this.props.userText }&key=${ YOU_TUBE_API_KEY }`;
    var _this = this;

    $.getJSON(checkLink).done( function(data) {
      if (data.pageInfo.totalResults === 0) {
        _this.setState({
          linkIsValid: false,
          linkWasChecked: true
        });
      }
      else if (data.pageInfo.totalResults === 1) {
        _this.setState({
          linkIsValid: true,
          linkWasChecked: true
        });
      } else {
        _this.setState({
          linkIsValid: true,
          linkWasChecked: false
        })
        throw new Error('YouTube returned an unexpected result on an id check');
      }
    });
  },

  componentWillReceiveProps: function (newProps) {
    if (newProps.userText !== this.props.userText) {
      this.setState({linkWasChecked: false});
    }
  },

  handleBlur: function () {
    if (!this.state.linkWasChecked || !this.state.linkIsValid) this.checkForValidity();
  },
  
  render: function(){
    var isInvalid = !this.state.linkIsValid && this.state.linkWasChecked;
    var isValid = this.state.linkIsValid && this.state.linkWasChecked;

    return(
      <div className={cx(this.props.className,'you-tube-link','component', {'invalid': (isInvalid), 'valid': (isValid) })}>
        <label htmlFor={this.props.fieldName}>
          {this.props.fieldName}
        </label>
        <input
          type="text"
          name={this.props.fieldName}
          value={this.props.userText}
          onChange={this.handleTextEdit}
          onFocus={this.handleFocus}
          onBlur={ this.handleBlur }
        />
      </div>
    )
  }
});
