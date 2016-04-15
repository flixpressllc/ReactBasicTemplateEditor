import React from 'react';
import Modal from 'react-modal';
import {Tabs, TabList, Tab, TabPanel} from './copied/react-tabs/lib/main';
import {promiseFlixpress, Flixpress} from './imports';

const STOCK_URL = 'https://fpsound.s3.amazonaws.com/';
const CUSTOM_URL = 'https://files.flixpress.com/CustomAudio/';

var SoundPicker = React.createClass({
  getInitialState: function () {
    return {modalIsOpen: false};
  },
  
  blankAudioInfo: {
    audioType: "NoAudio",
    audioUrl: "",
    id: 0,
    length: 0,
    name: ""
  },
  
  componentWillMount: function () {
    if (this.props.audioOptions === undefined) {
      this.props.onChooseSong(this.blankAudioInfo);
    }
  },
  
  openModal: function () {
    this.setState({modalIsOpen: true})
  },
  
  closeModal: function () {
    this.setState({modalIsOpen: false})
  },

  handleOnAfterOpenModal: function () {
    
    this.stopPlaying();
    
    // good place to start making server requests
    if (this.state.audioOptions === undefined) {
      //define it.
      promiseFlixpress.done(function () {
        Flixpress().td.getAudioOptions(this.props.username).done(function(result){
          this.setState({audioOptions: result});
        }.bind(this))
      }.bind(this));
    }
  },
  
  handleChooseSong: function (song, type) {
    var audioInfo;
    if (song === undefined) {
      audioInfo = this.blankAudioInfo;
    } else {
      var url;
      if (type === 'custom') {
        type = 'CustomAudio';
        url = CUSTOM_URL;
      } else {
        type = 'StockAudio';
        url = STOCK_URL;
      }
      audioInfo = {
        audioType: type,
        audioUrl: url + song.Id + '.mp3',
        id: song.Id,
        length: song.Length,
        name: song.Name
      };
    }
    this.props.onChooseSong(audioInfo);
    this.setState({modalIsOpen: false});
  },
  
  handlePlay: function (e) {
    this.stopPlaying();
    this.currentAudioElement = e.target;
  },
  
  stopPlaying: function () {
    if (this.currentAudioElement !== undefined) {
      this.currentAudioElement.pause();
    }
  },
  
  render: function () {
    var stockAudioItems = [];
    var customAudioItems = [];
    var tabNames = [];
    var tabPanels = [];
    
    if (this.state.audioOptions !== undefined) {
      if (this.state.audioOptions.categories !== undefined) {
        
        let categories = [];
        let panels = [];
        for (let key in this.state.audioOptions.categories) {
          categories.push(
            <Tab>{key}</Tab>
          );
          
          let songs = [];
          for (let i = 0; i < this.state.audioOptions.categories[key].songs.length; i++) {
            let song = this.state.audioOptions.categories[key].songs[i];
            songs.push(
              <Song song={song} type="stock" onChooseSong={this.handleChooseSong} onPlay={this.handlePlay}/>
            );
          }
          
          panels.push(<TabPanel>{songs}</TabPanel>);
        }
        stockAudioItems.push(<Tabs><TabList>{categories}</TabList>{panels}</Tabs>)
      }
      
      if (this.state.audioOptions.customAudio !== undefined) {
        
        for (let i = 0; i < this.state.audioOptions.customAudio.length; i++) {
          let song = this.state.audioOptions.customAudio[i];
          customAudioItems.push(
            <Song song={song} type="custom" onChooseSong={this.handleChooseSong} onPlay={this.handlePlay}/>
          );
        }

      }
      
      
      if (stockAudioItems.length > 0) {
        tabNames.push(<Tab>Stock Audio</Tab>);
        tabPanels.push(
          <TabPanel>
            <h2>Stock Audio</h2>
            {stockAudioItems}
          </TabPanel>
        );
      }
      if (customAudioItems.length > 0) {
        tabNames.push(<Tab>Custom Audio</Tab>);
        tabPanels.push(
          <TabPanel>
            <h2>Custom Audio</h2>
            {customAudioItems}
          </TabPanel>
        );
      }
    }
    
    var hasAudio =  (this.props.audioInfo !== undefined) ? true : false ;
    var name = hasAudio ? this.props.audioInfo.name : 'None' ;
    var url = hasAudio ? this.props.audioInfo.audioUrl : '' ;
    
    return (
      <div>
        <div>{name} <button type="button" onClick={this.openModal}>Change Audio</button></div>
        <ReactAudioPlayer src={url} preload="none" ref="mainAudio" onPlay={this.handlePlay}/>
        <Modal
          ref="modal"
          closeTimeoutMS={150}
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.handleOnAfterOpenModal}
          onRequestClose={this.handleModalCloseRequest}>
          
          <button type="button" onClick={this.closeModal}>close</button>
          <h1>Choose Your Audio</h1>
          <Tabs>
            <TabList>
              {tabNames}
            </TabList>
            {tabPanels}
          </Tabs>
        </Modal>
      </div>
    )
  }
});

var Song = React.createClass({
  handleClick: function () {
    this.props.onChooseSong(this.props.song, this.props.type);
  },
  
  render: function () {
    var url = (this.props.type === 'custom') ? CUSTOM_URL : STOCK_URL ;
    url += this.props.song.Id + '.mp3';
    return (
      <div>
        <button type="button" onClick={this.handleClick}>Choose</button>
        {this.props.song.Name}: <ReactAudioPlayer preload="none" src={url} onPlay={this.props.onPlay}/>
      </div>
    );
  }
})

const DEFAULT_LISTEN_INTERVAL = 1000;
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
    if (!this.listenTracker && this.props.onListen !== undefined) {
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