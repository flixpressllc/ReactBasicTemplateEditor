import React from 'react';
import Modal from './lib/Modal';
import {Tabs, TabList, Tab, TabPanel} from 'react-tabs';
import LoadingSpinner from './LoadingSpinner';
import cx from 'classnames';
import getAudioOptions from '../utils/getAudioOptions';
import './SoundPicker.scss';

const STOCK_URL = 'https://fpsound.s3.amazonaws.com/';
const CUSTOM_URL = 'https://files.flixpress.com/CustomAudio/';

Tabs.setUseDefaultStyles(false);

class SoundPicker extends React.Component {
  constructor (props) {
    super(props);
    this.player = new Audio();
    this.state = {modalIsOpen: false, isPlaying: false};

    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleStopPlayer = this.handleStopPlayer.bind(this);
    this.handleChooseSong = this.handleChooseSong.bind(this);
    this.handlePlaySong = this.handlePlaySong.bind(this);
    this.handleOnAfterOpenModal = this.handleOnAfterOpenModal.bind(this);
    this.handleRemoveAudio = this.handleRemoveAudio.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
  }

  getBlankAudioInfo () {
    return {
      audioType: 'NoAudio',
      audioUrl: '',
      id: 0,
      length: 0,
      name: ''
    }
  }

  getPlayerStyle () {
    if (this.audioIsChosen()){
      return {display: 'block'};
    } else {
      return {display: 'none'};
    }
  }

  audioIsChosen () {
    return this.props.audioInfo !== undefined && this.props.audioInfo.audioType !== 'NoAudio';
  }

  componentWillMount () {
    if (this.props.audioOptions === undefined) {
      this.props.onChooseSong(this.getBlankAudioInfo());
    }
  }

  handleOpenModal () {
    this.setState({modalIsOpen: true})
  }

  handleCloseModal () {
    this.setState({modalIsOpen: false})
  }

  componentWillUpdate (newProps, newState) {
    if (newState.modalIsOpen !== this.state.modalIsOpen) {
      this.stopFrontPlayer();
      this.handleStopPlayer();
    }
  }

  handleOnAfterOpenModal () {
    // good place to start making server requests
    if (this.state.audioOptions === undefined) {
      //define it.
      getAudioOptions(this.props.username).then( result => {
        this.setState({audioOptions: result});
      });
    }
  }

  handleChooseSong (song, type) {
    var audioInfo;
    if (song === undefined) {
      audioInfo = this.getBlankAudioInfo();
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
    this.handleStopPlayer();
    this.setState({modalIsOpen: false});
  }

  handleRemoveAudio () {
    this.props.onChooseSong(this.getBlankAudioInfo());
    this.setState({modalIsOpen: false});
  }

  stopFrontPlayer () {
    if (this.refs.frontPlayer.pause !== undefined){
      this.refs.frontPlayer.pause();
    }
  }



  handlePlaySong (songType, songId) {
    var url = (songType === 'custom') ? CUSTOM_URL : STOCK_URL ;
    url += songId + '.mp3';

    if (url !== this.player.src) {
      this.loadPlayer(url);
      this.setState({loadedSong: `${songType}-${songId}`})
    } else {
      this.startPlayer();
    }
  }

  loadPlayer (songUrl) {
    this.player.pause();
    this.player.src = songUrl;
    this.startPlayer();
  }

  startPlayer () {
    this.player.play();
    this.setState({isPlaying: true})
  }

  handleStopPlayer () {
    this.player.pause();
    this.setState({isPlaying: false})
  }

  render () {
    var stockAudioItems = [];
    var customAudioItems = [];
    var tabNames = [];
    var tabPanels = [];
    let spinner = null;

    if (this.state.audioOptions !== undefined) {
      if (this.state.audioOptions.categories !== undefined) {

        let categories = [];
        let panels = [];
        for (let key in this.state.audioOptions.categories) {
          let categorySafeName = key.replace(' ','-');
          categories.push(
            <Tab className="reactBasicTemplateEditor-SoundPicker-stockCategoryTab"
              key={`tab-${categorySafeName}`}>{key}</Tab>
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
                stop={this.handleStopPlayer}
                playSong={this.handlePlaySong}/>
            );
          }

          panels.push(<TabPanel key={`tab-panel-${categorySafeName}`}>{songs}</TabPanel>);
        }
        stockAudioItems.push(
          <Tabs key="stock-audio-tabs">
            <TabList className="reactBasicTemplateEditor-SoundPicker-stockCategoryTabList">{categories}</TabList>
            {panels}
          </Tabs>
        )
      }

      if (this.state.audioOptions.customAudio !== undefined) {

        for (let i = 0; i < this.state.audioOptions.customAudio.length; i++) {
          let song = this.state.audioOptions.customAudio[i];
          let isPlaying = false;
          if (this.state.isPlaying && this.state.loadedSong === 'custom-' + song.Id){
            isPlaying = true;
          }
          customAudioItems.push(
            <Song type="custom"
              key={`song-custom-${song.Id}`}
              isPlaying={isPlaying}
              song={song}
              onChooseSong={this.handleChooseSong}
              stop={this.handleStopPlayer}
              playSong={this.handlePlaySong}/>
          );
        }

      }


      if (stockAudioItems.length > 0) {
        tabNames.push(<Tab key="stock-audio-tab">Stock Audio</Tab>);
        tabPanels.push(
          <TabPanel key="stock-audio-panel">
            <h2 className="reactBasicTemplateEditor-SoundPicker-audioTypeTitle">Stock Audio</h2>
            {stockAudioItems}
          </TabPanel>
        );
      }
      if (customAudioItems.length > 0) {
        tabNames.push(<Tab key="custom-audio-tab">Custom Audio</Tab>);
        tabPanels.push(
          <TabPanel key="custom-audio-panel">
            <h2 className="reactBasicTemplateEditor-SoundPicker-audioTypeTitle">Custom Audio</h2>
            {customAudioItems}
          </TabPanel>
        );
      }
    } else {
      spinner = (
        <div style={{maxWidth: '200px', margin: '24px auto', textAlign: 'center'}}>
          <LoadingSpinner/>
          Loading...
        </div>
      );
    }

    var playerStyle = this.getPlayerStyle();

    var hasAudio =  (this.props.audioInfo !== undefined) ? true : false ;
    var name = hasAudio ? this.props.audioInfo.name : 'None' ;
    var url = hasAudio ? this.props.audioInfo.audioUrl : '' ;
    var buttonText = this.audioIsChosen() ? 'Change Audio' : 'Add Audio';
    var removeAudio = this.audioIsChosen() ? (<button
      className="reactBasicTemplateEditor-SoundPicker-removeAudio"
      type="button" onClick={this.handleRemoveAudio}>Remove Audio</button>) : '';

    return (
      <div className="reactBasicTemplateEditor-SoundPicker">
        <div className="reactBasicTemplateEditor-SoundPicker-playerWrapper" style={playerStyle}>
          <div className="reactBasicTemplateEditor-SoundPicker-chosenAudioTitle">{name}</div>
          <audio src={url} controls ref="frontPlayer" preload="none">
            <p>Your browser does not support the <code>audio</code> element.</p>
          </audio>
        </div>
        <button className="reactBasicTemplateEditor-SoundPicker-addAudioButton"
          type="button"
          onClick={this.handleOpenModal}>{buttonText}</button>
        {removeAudio}
        <Modal
          contentLabel="Sound Picker Modal"
          closeTimeoutMS={150}
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.handleOnAfterOpenModal}
          onRequestClose={this.handleCloseModal}>

          { spinner }

          <button className="reactBasicTemplateEditor-SoundPicker-modalCancel cancel" type="button" onClick={this.handleCloseModal}> Cancel </button>
          <Tabs>
            <TabList className="reactBasicTemplateEditor-SoundPicker-librarySwitch">
              {tabNames}
            </TabList>
            {tabPanels}
          </Tabs>
        </Modal>
      </div>
    )
  }
}

class Song extends React.Component {
  constructor (props) {
    super(props);
    this.state = {playing: false};

    this.handleChooseSong = this.handleChooseSong.bind(this);
    this.handleTogglePlay = this.handleTogglePlay.bind(this);
  }

  handleChooseSong () {
    this.props.onChooseSong(this.props.song, this.props.type);
  }

  handleTogglePlay () {
    if (this.props.isPlaying){
      this.stop();
    } else {
      this.play();
    }
  }

  play () {
    this.props.playSong(this.props.type, this.props.song.Id);
  }

  stop () {
    this.props.stop();
  }

  render () {
    var toggleBtn = this.props.isPlaying ? 'Stop' : 'Listen' ;
    return (
      <div className={cx('reactBasicTemplateEditor-SoundPicker-song',{playing: this.props.isPlaying})}>
        <button type="button"
          className="reactBasicTemplateEditor-SoundPicker-songPlayToggle"
          onClick={this.handleTogglePlay}>{toggleBtn}</button>
        <button type="button"
          className="reactBasicTemplateEditor-SoundPicker-songSelect"
          onClick={this.handleChooseSong}>Choose</button>
        <span className="reactBasicTemplateEditor-SoundPicker-songName">{this.props.song.Name}</span>
      </div>
    );
  }
}

export default SoundPicker;
