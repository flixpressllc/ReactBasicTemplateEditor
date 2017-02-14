import React from 'react';
import { shallow } from 'enzyme';
import EditingUi from './EditingUi';

let editingUiProps = {
  templateType:  'images',
  uiSections: [],
  allTextFields: [],
  allYouTubeLinks: [],
  allTextBoxes: [],
  allDropDowns: [],
  allColorPickers: [],
  onFieldsChange: () => {},
  onYouTubeLinksChange: () => {},
  onValidVideoFound: () => {},
  onTextBoxesChange: () => {},
  onDropDownChange: () => {},
  onColorPickerChange: () => {},
  imageBank:  [],
  onUpdateImages:  () => {}
}

// need to really mock out lost of jquery stuff
describe('EditingUi', () => {
  it('does not render images if the template type is textOnly', () => {
    let props = editingUiProps;
    props.templateType = 'textOnly';

    const component = shallow(<EditingUi {...props} />);

    expect(component.find('ImageContainer').length).toEqual(0);
  });
  it('renders images if the template type is images', () => {
    pending();
    let props = editingUiProps;
    props.templateType = 'images';
    props.allUserImageChoosers = {};

    const component = shallow(<EditingUi {...props} />);

    expect(component.find('ImageContainer').length).toEqual(1);
  });
});