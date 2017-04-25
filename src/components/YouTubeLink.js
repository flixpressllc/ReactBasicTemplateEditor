import React from 'react';
import cx from 'classnames';
import { YOU_TUBE_API_KEY } from '../stores/app-settings';
import { getJSON } from '../utils/ajax';
import { registerDataType } from '../utils/globalContainerConcerns';
import * as ContainerActions from '../actions/ContainerActions';

import './YouTubeLink.scss';

const DATA_TYPE_NAME = 'youTubeLink';

function youTubeRenderStringToData (renderString, obj) {
  let linkObj = {};

  const parts = renderString.split('|');
  linkObj.title = parts[0];
  linkObj.videoId = parts[1];
  linkObj.time = parts[2];
  linkObj.value = linkObj.videoId; // This is what gets displayed
  return Object.assign({}, obj, linkObj);
}

function youTubeDataToRenderString (linkObj) {
  if (linkObj.title === undefined || linkObj.videoId === undefined) {
    return '';
  }
  linkObj.title = linkObj.title.replace('|',' ');
  linkObj.time = linkObj.time || '';
  return [linkObj.title, linkObj.videoId, linkObj.time].join('|');
}

registerDataType(DATA_TYPE_NAME, {
  toRenderString: youTubeDataToRenderString,
  toDataObject: youTubeRenderStringToData
});

class YouTubeLink extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      linkIsValid: false,
      linkWasChecked: false
    };

    this.handleTextEdit = this.handleTextEdit.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleRemoveMarker = this.handleRemoveMarker.bind(this);
  }

  handleTextEdit (e){
    ContainerActions.changeContainer(
      DATA_TYPE_NAME,
      this.props.fieldName,
      {value: e.target.value}
    );
  }

  handleFocus () {
    this.props.onTextFieldFocus(this.props.fieldName);
  }

  isYoutubeUrl (string) {
    const YOUTUBE_URL_MATCHER = /youtube\.com|youtu\.be/i;
    return !!string.match(YOUTUBE_URL_MATCHER);
  }

  isPossibleVideoId (string) {
    const POSSIBLE_VIDEO_ID = /[^#?&]+$/;
    return !!string.match(POSSIBLE_VIDEO_ID);
  }

  findVideoDataFromUrl (fullUserInput) {
    // https://regex101.com/r/UGDLRS/3
    const YOUTUBE_ID_AND_TIME_MATCHER = /.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*?(?:[?&]t=([^#&?]*))?.*/;
    let result = fullUserInput.match(YOUTUBE_ID_AND_TIME_MATCHER);
    return {
      id: result[1],
      time: result[2]
    };
  }

  reportValidVideoData () {
    ContainerActions.changeContainer(
      DATA_TYPE_NAME,
      this.props.fieldName,
      {videoId: this.state.videoId, title: this.state.title}
    );
  }

  setInvalidWithError (e) {
    this.setInvalid();
    throw e;
  }

  setInvalid () {
    this.setState({
      linkIsValid: false,
      linkWasChecked: true,
      isCheckingValidity: false
    })
  }

  setValidWithError (e, videoId, title) {
    this.setValid(videoId, title);
    throw e;
  }

  setValid (videoId, title) {
    this.setState({
      linkIsValid: true,
      linkWasChecked: true,
      isCheckingValidity: false,
      videoId: videoId,
      title: title
    }, this.reportValidVideoData);
  }

  validate () { return new Promise((resolve) => {
    let userText = this.props.userText;
    let id, url;

    if (!userText) return;

    if (this.isYoutubeUrl(userText)) {
      url = userText;
      let data = this.findVideoDataFromUrl(url);
      id = data.id;
    } else if (this.isPossibleVideoId(userText)) {
      id = userText;
    } else {
      this.setInvalidWithError(new Error('Unknown variation on userText: ' + userText));
    }

    this.checkYouTubeForValidity(id)
    .then(boolFromCheckYouTube => {
      if (boolFromCheckYouTube) {
        this.setValid();
      } else {
        this.setInvalid();
      }
      resolve(boolFromCheckYouTube);
    })
    .catch(errorFromCheckYouTube => {
      this.setValidWithError(errorFromCheckYouTube);
    });
  })}

  checkYouTubeForValidity (videoId) {return new Promise((resolve) => {
    this.setState({isCheckingValidity: true});

    var checkLink = `https://www.googleapis.com/youtube/v3/videos?part=id,snippet&id=${ videoId }&key=${ YOU_TUBE_API_KEY }`;

    getJSON(checkLink)
      .then( returnObject => {
        let data = returnObject.data;
        if (data.pageInfo.totalResults === 0) {
          resolve(false);
        } else if (data.pageInfo.totalResults === 1) {
          this.setValid(videoId,data.items[0].snippet.title);
        } else {
          this.setValidWithError(new Error('YouTube returned an unexpected result on an id check'), videoId);
        }
      })
      .catch( () => {
        this.setValidWithError(new Error('YouTube returned an error on an id check'), videoId);
      });

  })}

  componentWillReceiveProps (newProps) {
    if (newProps.userText !== this.props.userText) {
      this.setState({linkWasChecked: false});
    }
  }

  handleBlur () {
    if (!this.state.linkWasChecked || !this.state.linkIsValid) this.validate();
  }

  handleRemoveMarker () {
    this.setState({linkWasChecked:false}, () => {
      if (this.inputReference) {
        this.inputReference.focus();
      }
    });
  }

  render () {
    var isInvalid = !this.state.linkIsValid && this.state.linkWasChecked;
    var isValid = this.state.linkIsValid && this.state.linkWasChecked;

    var inputOrMarker = isValid ? (
      <div className='reactBasicTemplateEditor-YouTubeLink-marker'>
        {this.state.title}
        <button className='reactBasicTemplateEditor-YouTubeLink-markerButton'
          type='button' onClick={ this.handleRemoveMarker }> Edit </button>
      </div>
    ) : (
      <input
        className='reactBasicTemplateEditor-YouTubeLink-input'
        ref={ el => {this.inputReference = el} }
        type="text"
        name={this.props.fieldName}
        value={this.props.userText}
        onChange={this.handleTextEdit}
        onFocus={this.handleFocus}
        onBlur={ this.handleBlur }
      />
  );

    return(
      <div className={cx(this.props.className,'reactBasicTemplateEditor-YouTubeLink', {'invalid': (isInvalid), 'valid': (isValid), 'waiting': this.state.isCheckingValidity })}>
        <label htmlFor={this.props.fieldName}>
          {this.props.fieldName}
        </label>
        { inputOrMarker }
      </div>
    )
  }
}

YouTubeLink.defaultProps = { userText: '' };

export default YouTubeLink;
