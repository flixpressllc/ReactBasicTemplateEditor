import React from 'react';
import { mount } from 'enzyme';
import SoundPicker from './SoundPicker'

jest.mock('../utils/getAudioOptions');

// <SoundPicker
//   audioInfo={this.state.audioInfo}
//   username={this.props.userSettingsData.username}
//   onChooseSong={this.handleChooseSong}
// />

describe('SoundPicker', () => {
  it('renders without crashing', () => {
    expect(() => {
      mount(<SoundPicker onChooseSong={ jest.fn() } />);
    }).not.toThrow();
  });

  describe('choosing a song', () => {
    it('opens a modal on Add Audio button click', () => {
      const component = mount(<SoundPicker onChooseSong={ jest.fn() }/>)
      component.instance().handleOnAfterOpenModal = jest.fn();

      component.find('.reactBasicTemplateEditor-SoundPicker-addAudioButton').simulate('click');

      expect(component.state().modalIsOpen).toEqual(true);
    });
    it('reports a song when chosen', () => {
      // impossible to test with current setup/my limited knowledge of react-modal
      pending();

      expect();
    });
  });
});
