import getAudioOptions from './getAudioOptions';

global.window.$ = require('jquery');

describe('getAutioOptions', () => {
  describe('custom audio', () => {
    it('returns an empty array if custom audio is unavailable', () => {
      pending();
      getAudioOptions.getAudioOptions('DonDenton');
    });
  });

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
