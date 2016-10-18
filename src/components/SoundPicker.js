import React from 'react';
import Modal from 'react-modal';
import {Tabs, TabList, Tab, TabPanel} from './copied/react-tabs/lib/main';
import {promiseFlixpress} from './imports';
import {CONTAINING_ELEMENT_ID} from '../config/unavoidable-constants';
import cx from 'classnames';
import xmlParser from '../utils/xml-parser';

const STOCK_URL = 'https://fpsound.s3.amazonaws.com/';
const CUSTOM_URL = 'https://files.flixpress.com/CustomAudio/';

Tabs.setUseDefaultStyles(false);

var SoundPicker = React.createClass({
  getInitialState: function () {
    return {modalIsOpen: false, isPlaying: false};
  },
  
  blankAudioInfo: {
    audioType: 'NoAudio',
    audioUrl: '',
    id: 0,
    length: 0,
    name: ''
  },
  
  getPlayerStyle: function () {
    if (this.audioIsChosen()){
      return {display: 'block'};
    } else {
      return {display: 'none'};
    }
  },
  
  audioIsChosen: function () {
    return this.props.audioInfo !== undefined && this.props.audioInfo.audioType !== 'NoAudio';
  },
  
  componentWillMount: function () {
    if (this.props.audioOptions === undefined) {
      this.props.onChooseSong(this.blankAudioInfo);
      Modal.setAppElement('#' + CONTAINING_ELEMENT_ID);
    }
  },
  
  openModal: function () {
    this.setState({modalIsOpen: true})
  },
  
  closeModal: function () {
    this.setState({modalIsOpen: false})
  },

  componentWillUpdate: function (newProps, newState) {
    if (newState.modalIsOpen !== this.state.modalIsOpen) {
      this.stopFrontPlayer();
      this.stopPlayer();
    }
  },
  
  handleOnAfterOpenModal: function () {
    // good place to start making server requests
    if (this.state.audioOptions === undefined) {
      //define it.
      promiseFlixpress.done(function (Flixpress) {
        xmlParser.getAudioOptions(this.props.username).done(function(result){
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
    this.stopPlayer();
    this.setState({modalIsOpen: false});
  },
  
  handleRemoveAudio: function () {
    this.props.onChooseSong(this.blankAudioInfo);
    this.setState({modalIsOpen: false});
  },
  
  stopFrontPlayer: function () {
    if (this.refs.frontPlayer.pause !== undefined){
      this.refs.frontPlayer.pause();
    }
  },
  
  player: new Audio(),
  
  handlePlaySong: function (songType, songId) {
    var url = (songType === 'custom') ? CUSTOM_URL : STOCK_URL ;
    url += songId + '.mp3';
    
    if (url !== this.player.src) {
      this.loadPlayer(url);
      this.setState({loadedSong: `${songType}-${songId}`})
    } else {
      this.startPlayer();
    }
  },
  
  loadPlayer: function (songUrl) {
    this.player.pause();
    this.player.src = songUrl;
    this.startPlayer();
  },
  
  startPlayer: function () {
    this.player.play();
    this.setState({isPlaying: true})
  },
  
  stopPlayer: function () {
    this.player.pause();
    this.setState({isPlaying: false})
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
          let categorySafeName = key.replace(' ','-');
          categories.push(
            <Tab key={`tab-${categorySafeName}`}>{key}</Tab>
          );
          
          let songs = [];
          for (let i = 0; i < this.state.audioOptions.categories[key].songs.length; i++) {
            let song = this.state.audioOptions.categories[key].songs[i];
            let isPlaying = false;
            if (this.state.isPlaying && this.state.loadedSong === 'stock-' + song.Id){
              isPlaying = true;
            }
            songs.push(
              <Song type="stock"
                key={`song-stock-${song.Id}`}
                isPlaying={isPlaying}
                song={song}
                onChooseSong={this.handleChooseSong}
                stop={this.stopPlayer}
                playSong={this.handlePlaySong}/>
            );
          }
          
          panels.push(<TabPanel key={`tab-panel-${categorySafeName}`}>{songs}</TabPanel>);
        }
        stockAudioItems.push(<Tabs key="stock-audio-tabs"><TabList>{categories}</TabList>{panels}</Tabs>)
      }
      
      if (this.state.audioOptions.customAudio !== undefined) {
        
        for (let i = 0; i < this.state.audioOptions.customAudio.length; i++) {
          let song = this.state.audioOptions.customAudio[i];
          let isPlaying = false;
          if (this.state.isPlaying && this.loadedSong === 'custom-' + song.Id){
            isPlaying = true;
          }
          customAudioItems.push(
            <Song type="custom"
              key={`song-custom-${song.Id}`}
              isPlaying={isPlaying}
              song={song}
              onChooseSong={this.handleChooseSong}
              stop={this.stopPlayer}
              playSong={this.handlePlaySong}/>
          );
        }

      }
      
      
      if (stockAudioItems.length > 0) {
        tabNames.push(<Tab key="stock-audio-tab">Stock Audio</Tab>);
        tabPanels.push(
          <TabPanel key="stock-audio-panel">
            <h2>Stock Audio</h2>
            {stockAudioItems}
          </TabPanel>
        );
      }
      if (customAudioItems.length > 0) {
        tabNames.push(<Tab key="custom-audio-tab">Custom Audio</Tab>);
        tabPanels.push(
          <TabPanel key="custom-audio-panel">
            <h2>Custom Audio</h2>
            {customAudioItems}
          </TabPanel>
        );
      }
    }
    
    var playerStyle = this.getPlayerStyle();
    
    var hasAudio =  (this.props.audioInfo !== undefined) ? true : false ;
    var name = hasAudio ? this.props.audioInfo.name : 'None' ;
    var url = hasAudio ? this.props.audioInfo.audioUrl : '' ;
    var buttonText = this.audioIsChosen() ? 'Change Audio' : 'Add Audio';
    var removeAudio = this.audioIsChosen() ? (<button type="button" onClick={this.handleRemoveAudio}>Remove Audio</button>) : '';
    
    return (
      <div className="sound-picker-component component">
        <h3>Choose Your Audio</h3>
        <div className="chosen-audio-title">{name}</div>
        <div className="chosen-audio-player-wrapper" style={playerStyle}>
          <audio src={url} controls ref="frontPlayer">
            <p>Your browser does not support the <code>audio</code> element.</p>
          </audio>
        </div>
        <button type="button" onClick={this.openModal}>{buttonText}</button>
        {removeAudio}
        <Modal
          ref="modal"
          closeTimeoutMS={150}
          isOpen={this.state.modalIsOpen}
          className="sound-picker-modal modal"
          overlayClassName="sound-picker-modal-overlay overlay"
          onAfterOpen={this.handleOnAfterOpenModal}
          onRequestClose={this.handleModalCloseRequest}>
          
          <button className="cancel" type="button" onClick={this.closeModal}>cancel</button>
          <Tabs>
            <TabList className="picker-header">
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
  getInitialState: function () {
    return {playing: false}
  },
  
  choose: function () {
    this.props.onChooseSong(this.props.song, this.props.type);
  },
  
  togglePlay: function () {
    if (this.props.isPlaying){
      this.stop();
    } else {
      this.play();
    }
  },
  
  play: function () {
    this.props.playSong(this.props.type, this.props.song.Id);
  },
  
  stop: function () {
    this.props.stop();
  },
  
  render: function () {
    var toggleBtn = this.props.isPlaying ? 'Stop' : 'Listen' ;
    return (
      <div className={cx('song-item',{playing: this.props.isPlaying})}>
        <button type="button" className="play-toggle" onClick={this.togglePlay}>{toggleBtn}</button>
        <button type="button" onClick={this.choose}>Choose</button>
        <span className="song-name">{this.props.song.Name}</span>
      </div>
    );
  }
})

export default SoundPicker;