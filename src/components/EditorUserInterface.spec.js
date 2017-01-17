import React from 'react';
import { shallow } from 'enzyme';
import EditorUserInterface from './EditorUserInterface';

it('renders without crashing', () => {
  let settings = {
    uiSettingsJsonUrl: '/templates/Template1000.json',
    userSettingsData: {
      templateType: 'text',
      username: 'DonDenton',
      templateId: 79,
      minutesRemainingInContract: 170.2819,
      minimumTemplateDuration: 0.1667,
      previewVideoUrl: '',
      isChargePerOrder: false,
      renderCost: 8
    }
  };
  
  expect(() => {
    shallow(<EditorUserInterface
      uiSettingsJsonUrl={ settings.uiSettingsJsonUrl }
      userSettingsData={ settings.userSettingsData }/>);
  }).not.toThrow();
});
