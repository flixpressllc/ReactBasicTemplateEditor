import getAudioOptions, {_getCustomSongsForUser} from './getAudioOptions';

global.window.$ = require('jquery');

describe('_getCustomSongsForUser', () => {
  it('returns an empty array if custom audio is unavailable', () => {
    return _getCustomSongsForUser('devolved40').then(result => {
      expect(result).toEqual([])
    });
  });
});

describe('getAudioOptions', () => {
  it('returns a promise that responds to done', () => {
    const done = getAudioOptions('bowdo').done
    expect(done).not.toEqual(undefined);
  });

  it('yields the expected data in done', () => {
    const p = new Promise(res => {
      getAudioOptions('DonDenton').done(data => res(data))
    });
    return p.then(results => {
      expect(results).toMatchSnapshot();
    })
  });
});
