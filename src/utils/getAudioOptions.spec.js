import getAudioOptions, {_getCustomSongsForUser} from './getAudioOptions';
import { toType } from 'happy-helpers';

global.window.$ = require('jquery');

describe('_getCustomSongsForUser', () => {
  it('returns an empty array if custom audio is unavailable', () => {
    return _getCustomSongsForUser('mine').then(result => {
      expect(result).toEqual([])
    });
  });

  it('returns an array if 1 result', () => {
    return _getCustomSongsForUser('DonDentonAdmin').then(result => {
      expect(toType(result)).toEqual('array')
      expect(result.length).toEqual(1)
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
