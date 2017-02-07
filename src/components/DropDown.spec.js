import React from 'react';
import { mount, render, shallow } from 'enzyme';
import DropDown from './DropDown';


describe('DropDown', () => {
  it('renders without crashing', () => {
    expect(() => mount(
      <DropDown />
    )).not.toThrow();
  });

  it('displays its name in the label', () => {
    const component = render(<DropDown fieldName='mario'/>)

    expect(component.find('label').text()).toEqual('mario');
  });

  it('renders the options', () => {
    const options = [
      {name: 'Mario', value: 'mario'},
      {name: 'Luigi', value: 'luigi'}
    ];
    const component = mount(<DropDown fieldName='mario' options={ options }/>)

    expect(component.find('option').length).toEqual(2);
    expect(component.find('option').get(0).value).toEqual('mario');
    expect(component.find('option').get(1).value).toEqual('luigi');
  });

  it('calls the onDropDownChange function when a change is made', () => {
    const fakeChange = {target: {value: 'stuff'}};
    const fakeFn = jest.fn(() => {});
    const component = mount(<DropDown onDropDownChange={ fakeFn } fieldName='myName' />)

    component.find('select').simulate('change', fakeChange);

    expect(fakeFn).toHaveBeenCalled();
  });

  it('calls the onDropDownFocus function when the input field is focused', () => {
    const fakeFn = jest.fn(() => {});
    const component = shallow(<DropDown
      fieldName='Name of this field'
      onDropDownFocus={ fakeFn } />);

    component.find('select').simulate('focus');

    expect(fakeFn).toHaveBeenCalledWith('Name of this field');
  });

});
