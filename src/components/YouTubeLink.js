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
      linkWasChecked: false
    };
  },

  isYoutubeUrl: function (string) {
    const YOUTUBE_URL_MATCHER = /youtube\.com|youtu\.be/i;
    return !!string.match(YOUTUBE_URL_MATCHER);
  },

  isPossibleVideoId: function (string) {
    const POSSIBLE_VIDEO_ID = /[^#?&]+$/;
    return !!string.match(POSSIBLE_VIDEO_ID);
  },

  findVideoDataFromUrl: function (fullUserInput) {
    // https://regex101.com/r/UGDLRS/3
    const YOUTUBE_ID_AND_TIME_MATCHER = /.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*?(?:[?&]t=([^#&?]*))?.*/;
    let result = fullUserInput.match(YOUTUBE_ID_AND_TIME_MATCHER);
    return {
      id: result[1],
      time: result[2]
    };
  },

  setInvalidWithError: function (e) {
    this.setInvalid();
    throw e;
  },

  setInvalid: function () {
    this.setState({
      linkIsValid: false,
      linkWasChecked: true,
      isCheckingValidity: false
    })
  },

  setValidWithError: function (e) {
    this.setValid();
    throw e;
  },

  setValid: function () {
    this.setState({
      linkIsValid: true,
      linkWasChecked: true,
      isCheckingValidity: false
    })
  },

  validate: function () {
    let userText = this.props.userText;
    let id, url;

    if (this.isYoutubeUrl(userText)) {
      url = userText;
      let data = this.findVideoDataFromUrl(url);
      id = data.id;
    } else if (this.isPossibleVideoId(userText)) {
      id = userText;
    } else {
      this.setInvalidWithError(new Error('Unknown variation on userText: ' + userText));
    }

    this.checkForValidity(id);
  },

  checkForValidity: function (videoId) {
    this.setState({isCheckingValidity: true});
    
    var checkLink = `https://www.googleapis.com/youtube/v3/videos?part=id&id=${ videoId }&key=${ YOU_TUBE_API_KEY }`;
    var _this = this;

    $.getJSON(checkLink)
      .done( function(data) {
        if (data.pageInfo.totalResults === 0) {
          _this.setInvalid();
        } else if (data.pageInfo.totalResults === 1) {
          _this.setValid();
        } else {
          _this.setValidWithError(new Error('YouTube returned an unexpected result on an id check'));
        }
      })
      .fail( function() {
        _this.setValidWithError(new Error('YouTube returned an error on an id check'));
      });

  },

  componentWillReceiveProps: function (newProps) {
    if (newProps.userText !== this.props.userText) {
      this.setState({linkWasChecked: false});
    }
  },

  handleBlur: function () {
    if (!this.state.linkWasChecked || !this.state.linkIsValid) this.validate();
  },
  
  render: function(){
    var isInvalid = !this.state.linkIsValid && this.state.linkWasChecked;
    var isValid = this.state.linkIsValid && this.state.linkWasChecked;

    return(
      <div className={cx(this.props.className,'you-tube-link','component', {'invalid': (isInvalid), 'valid': (isValid), 'waiting': this.state.isCheckingValidity })}>
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
