import React from 'react';
import { mount, render, shallow } from 'enzyme';
import ImageContainer from './ImageContainer'

// <ImageContainer
//   images={this.state.audioInfo}
//   onUpdateImages={this.handleChooseSong}
// />

describe('ImageContainer', () => {
  it('renders without crashing', () => {
    expect(() => {
      mount(<ImageContainer images={ [] }  onUpdateImages={ jest.fn() }/>);
    }).not.toThrow();
  });
});
