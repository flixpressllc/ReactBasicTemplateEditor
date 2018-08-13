import React from 'react';
import {shallow } from 'enzyme';
import DropDown from './DropDown';

jest.mock('../actions/ContainerActions');
const FakeContainerActions = require('../actions/ContainerActions');

describe('DropDown', () => {
  it('renders without crashing', () => {
    const component = shallow(<DropDown/>)
    expect(component.exists()).toBe(true)
  });

  it('displays its name in the label', () => {
    const component = shallow(<DropDown fieldName='mario'/>)

    expect(component.find('label').text()).toEqual('mario');
  });

  it('renders the options', () => {
    const options = [
      {name: 'Mario', value: 'mario'},
      {name: 'Luigi', value: 'luigi'}
    ];

    const component = shallow(<DropDown fieldName='mario' options={ options }/>)
    expect(component.find('option').length).toEqual(2);
    expect(component.find('option').first().props().value).toEqual('mario');
    expect(component.find('option').get(1).props.value).toEqual('luigi');
  }); 

  it('calls the onDropDownChange function when a change is made', () => {
    const fakeChange = {target: {value: 'stuff'}};
    const component = shallow(<DropDown fieldName='myName' />)

    component.find('select').simulate('change', fakeChange);

    expect(FakeContainerActions.changeContainer).toHaveBeenCalledWith('dropDown', 'myName', {value: 'stuff'})
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
