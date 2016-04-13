import React from 'react';
import Modal from 'react-modal';
import {promiseFlixpress, Flixpress} from './imports';

var SoundPicker = React.createClass({
  getInitialState: function () {
    return {modalIsOpen: false};
  },
  
  openModal: function () {
    this.setState({modalIsOpen: true})
  },
  
  closeModal: function () {
    this.setState({modalIsOpen: false})
  },

  handleOnAfterOpenModal: function () {
    // good place to start making server requests
    if (this.state.audioOptions === undefined || true) {
      //define it.
      promiseFlixpress.done(function () {
        Flixpress().td.getAudioOptions(this.props.username).done(function(result){
          this.setState({audioOptions: result});
        }.bind(this))
      }.bind(this));
    }
  },
  
  render: function () {
    return (
      <div>
        <div>{this.props.audioInfo.name} <a onClick={this.openModal}>Open</a></div>
        <ReactAudioPlayer src={this.props.audioInfo.audioUrl}/>
        <Modal
          ref="modal"
          closeTimeoutMS={150}
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.handleOnAfterOpenModal}
          onRequestClose={this.handleModalCloseRequest}>
          
          <a onClick={this.closeModal}>close</a>
          <h1>Choose Your Audio</h1>
        </Modal>
      </div>
    )
  }
});

var ReactAudioPlayer = React.createClass({
  componentDidMount() {
    const audio = this.refs.audio;

    audio.addEventListener('error', (e) => {
      this.props.onError && this.props.onError(e);
    });

    // When enough of the file has downloaded to start playing
    audio.addEventListener('canplay', (e) => {
      this.props.onCanPlay && this.props.onCanPlay(e);
    });

    // When enough of the file has downloaded to play the entire file
    audio.addEventListener('canplaythrough', (e) => {
      this.props.onCanPlayThrough && this.props.onCanPlayThrough(e);
    });

    // When audio play starts
    audio.addEventListener('play', (e) => {
      this.setListenTrack();
      this.props.onPlay && this.props.onPlay(e);
    });

    // When unloading the audio player (switching to another src)
    audio.addEventListener('abort', (e) => {
      this.clearListenTrack();
      this.props.onAbort && this.props.onAbort(e);
    });

    // When the file has finished playing to the end
    audio.addEventListener('ended', (e) => {
      this.clearListenTrack();
      this.props.onEnd && this.props.onEnd(e);
    });

    // When the user pauses playback
    audio.addEventListener('pause', (e) => {
      this.clearListenTrack();
      this.props.onPause && this.props.onPause(e);
    });

    // When the user drags the time indicator to a new time
    audio.addEventListener('seeked', (e) => {
      this.clearListenTrack();
      this.props.onSeeked && this.props.onSeeked(e);
    });
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedPlayerEvent) {
      const audio = this.refs.audio;

      audio.currentTime = nextProps.selectedPlayerEvent.playTime;
      audio.play();
    }
  },

  render() {
    const incompatibilityMessage = this.props.children || (
      <p>Your browser does not support the <code>audio</code> element.</p>
    );

    return (
      <audio
        className="react-audio-player"
        src={this.props.src}
        autoPlay={this.props.autoPlay}
        preload={this.props.preload}
        controls
        ref="audio"
        onPlay={this.onPlay}
      >
        {incompatibilityMessage}
      </audio>
    );
  },

  /**
   * Set an interval to call props.onListen every props.listenInterval time period
   */
  setListenTrack(currentTime) {
    if (!this.listenTracker) {
      const listenInterval = this.props.listenInterval || DEFAULT_LISTEN_INTERVAL;
      this.listenTracker = setInterval(() => {
        this.props.onListen(this.refs.audio.currentTime);
      }, listenInterval);
    }
  },

  /**
   * Clear the onListen interval
   */
  clearListenTrack() {
    clearInterval(this.listenTracker);
  },
});

export default SoundPicker;