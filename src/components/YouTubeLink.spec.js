import React from 'react';
import { shallow } from 'enzyme';
import YouTubeLink from './YouTubeLink';

it('renders without crashing', () => {
  shallow(<YouTubeLink />);
});

describe('findVideoDataFromUrl()', () => {
  const findVideoDataFromUrl = shallow(<YouTubeLink />).instance().findVideoDataFromUrl;
  
  it('gets an id from a full youtu.be link', () => {
    let result = findVideoDataFromUrl('http://youtu.be/0zM3nApSvMg');
    expect(result.id).toEqual('0zM3nApSvMg');
  });

  it('gets a time from a full youtu.be link', () => {
    let result = findVideoDataFromUrl('http://youtu.be/0zM3nApSvMg?t=47s');
    expect(result.time).toEqual('47s');
  });

  it('gets an id from a youtube.com/watch link', () => {
    let result = findVideoDataFromUrl('https://www.youtube.com/watch?v=e-5obm1G_FY');
    expect(result.id).toEqual('e-5obm1G_FY');
  });

  it('gets a time from a youtube.com/watch link', () => {
    let result = findVideoDataFromUrl('https://www.youtube.com/watch?v=e-5obm1G_FY&t=47s');
    expect(result.time).toEqual('47s');
  });

  it('gets an id from a youtube.com/embed link', () => {
    let result = findVideoDataFromUrl('https://www.youtube.com/embed/e-5obm1G_FY');
    expect(result.id).toEqual('e-5obm1G_FY');
  });
});

describe('isYoutubeUrl()', () => {
  const isYoutubeUrl = shallow(<YouTubeLink />).instance().isYoutubeUrl;
  it('assumes a url if it contains a youtube domain', () => {
    let result = isYoutubeUrl('https://youtube.com/watch');
    expect(result).toEqual(true);
  });
  it('assumes not a url if it does not contain a youtube domain', () => {
    let result = isYoutubeUrl('https://ye.com/watch');
    expect(result).toEqual(false);
  });
});

describe('isPossibleVideoId()', () => {
  const isPossibleVideoId = shallow(<YouTubeLink />).instance().isPossibleVideoId;
  describe('rejecting a string with non-youtube id characters', () => {

    const nonYoutubeIdCharacters = '#&?'.split('');
    nonYoutubeIdCharacters.map( (char)=>{

      it(`rejects "${ char }"`, () => {
        let result = isPossibleVideoId('e-5obm1G_FY' + char);
        expect(result).toEqual(false)
      });

    });
  });
});

describe('onblur', () => {
  it('adds an invalid class if invalid', () => {
    const component = shallow(<YouTubeLink />);
    const fakeCheck = () => component.setState({linkIsValid: false, linkWasChecked: true})
    component.instance().validate = fakeCheck;

    component.find('input').at(0).simulate('blur');

    expect(component.find('.invalid').length).toEqual(1);
  });

  it('adds an valid class if valid', () => {
    const component = shallow(<YouTubeLink />);
    const fakeCheck = () => component.setState({linkIsValid: true, linkWasChecked: true})
    component.instance().validate = fakeCheck;

    component.find('input').at(0).simulate('blur');

    expect(component.find('.valid').length).toEqual(1);
  });
});
