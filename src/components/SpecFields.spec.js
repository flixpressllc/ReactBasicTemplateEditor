import React from 'react';
import { shallow } from 'enzyme';
import SpecFields from './SpecFields';

let specFieldsProps = {
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
describe('SpecFields', () => {
  it('does not render images if the template type is textOnly', () => {
    let props = specFieldsProps;
    props.templateType = 'textOnly';

    const component = shallow(<SpecFields {...props} />);

    expect(component.find('ImageContainer').length).toEqual(0);
  });
  it('renders images if the template type is images', () => {
    pending();
    let props = specFieldsProps;
    props.templateType = 'images';
    props.allUserImageChoosers = {};

    const component = shallow(<SpecFields {...props} />);

    expect(component.find('ImageContainer').length).toEqual(1);
  });
});