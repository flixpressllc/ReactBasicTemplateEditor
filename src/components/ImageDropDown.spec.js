import React from 'react';
import { mount, render, shallow } from 'enzyme';
import ImageDropDown from './ImageDropDown';

describe('ImageDropDown', () => {
  it('renders without crashing', () => {
    expect(() => mount(
      <ImageDropDown />
    )).not.toThrow();
  });

  it('displays its name in the label', () => {
    const component = render(<ImageDropDown fieldName='mario'/>)

    expect(component.find('label').text()).toEqual('mario');
  });

  it('renders the options', () => {
    const options = [
      {name: 'Mario', value: 'mario'},
      {name: 'Luigi', value: 'luigi'}
    ];
    const component = mount(<ImageDropDown fieldName='mario' options={ options }/>)

    expect(component.find('option').length).toEqual(2);
    expect(component.find('option').get(0).value).toEqual('mario');
    expect(component.find('option').get(1).value).toEqual('luigi');
  });

  it('calls the onDropDownFocus function when the input field is focused', () => {
    const fakeFn = jest.fn(() => {});
    const component = shallow(<ImageDropDown
      fieldName='Name of this field'
      onDropDownFocus={ fakeFn } />);

    component.find('select').simulate('focus');

    expect(fakeFn).toHaveBeenCalledWith('Name of this field');
  });

});
