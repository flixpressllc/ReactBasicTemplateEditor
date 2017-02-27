import React from 'react';
import { mount, render } from 'enzyme';
import App from '../src/components/App';

// need to really mock out lost of jquery stuff
describe('Feature: Images only display in image templates', () => {
  pending();
  beforeAll( () => { global.window.$ = () => {}; } )
  it('renders images', () => {
    let settings = {
      uiSettingsJsonUrl: '/templates/Template1000.json',
      templateType: 'images',
      userSettingsData: {
        username: 'DonDenton',
        templateId: 79,
        minutesRemainingInContract: 170.2819,
        minimumTemplateDuration: 0.1667,
        previewVideoUrl: '',
        isChargePerOrder: false,
        renderCost: 8
      }
    };

    const component = mount(<App
      templateType={ settings.templateType }
      uiSettingsJsonUrl={ settings.uiSettingsJsonUrl }
      userSettingsData={ settings.userSettingsData }/>);

    expect(component.find('ImageContainer').length).toEqual(1);
  });
});