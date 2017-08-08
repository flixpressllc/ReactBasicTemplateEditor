import React from 'react';
import { mount, render, shallow } from 'enzyme';
import ImageDropDown from './ImageDropDown';

function getProps(props = {}) {
  return Object.assign({index: 0}, props);
}

describe('ImageDropDown', () => {
  it('renders without crashing', () => {
    expect(() => mount(
      <ImageDropDown {...getProps()} />
    )).not.toThrow();
  });

  it('displays its name in the label', () => {
    const props = getProps({fieldName: 'mario'});
    const component = render(<ImageDropDown {...props} />)

    expect(component.find('label').text()).toEqual('mario');
  });

  it('renders the options', () => {
    const options = [
      {name: 'Mario', value: 'mario'},
      {name: 'Luigi', value: 'luigi'}
    ];
    const props = getProps({fieldName: 'mario', options});
    const component = mount(<ImageDropDown {...props}/>)

    expect(component.find('option').length).toEqual(2);
    expect(component.find('option').get(0).value).toEqual('mario');
    expect(component.find('option').get(1).value).toEqual('luigi');
  });

  it('calls the onDropDownFocus function when the input field is focused', () => {
    const fakeFn = jest.fn(() => {});
    const props = getProps({fieldName: 'Name of this field', onDropDownFocus: fakeFn});
    const component = shallow(<ImageDropDown {...props} />);

    component.find('select').simulate('focus');

    expect(fakeFn).toHaveBeenCalledWith('Name of this field');
  });

});
