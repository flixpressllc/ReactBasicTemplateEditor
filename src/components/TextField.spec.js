import React from 'react';
import { mount, render } from 'enzyme';
import TextField from './TextField';

jest.mock('../actions/ContainerActions');
const FakeContainerActions = require('../actions/ContainerActions');

describe('TextField', () => {
  it('renders without crashing', () => {
    expect(() => mount(
      <TextField />
    )).not.toThrow();
  });

  it('displays its name in the label', () => {
    const component = render(<TextField fieldName='mario'/>)

    expect(component.find('label').text()).toEqual('mario');
  });

  it('displays the value in the textarea', () => {
    const component = render(<TextField fieldName='mario' value={'My Text'} />)

    expect(component.find('input').val()).toEqual('My Text');
  });

  it('calls the onUserInput function when text is altered', () => {
    const fakeEvent = {target:{value:'new value'}};
    const component = mount(<TextField fieldName='myName'/>)

    component.find('input').simulate('change', fakeEvent);

    expect(FakeContainerActions.changeContainer).toHaveBeenLastCalledWith('textField', 'myName', {value: 'new value'})
  });

  it('calls the onTextFieldFocus function when the input field is focused', () => {
    const fakeFn = jest.fn(() => {});
    const component = mount(<TextField onTextFieldFocus={ fakeFn }
      fieldName='Name of this field'
      />)

    component.find('input').simulate('focus');

    expect(fakeFn).toHaveBeenLastCalledWith('Name of this field');
  });

  describe('filter options', () => {
    describe('maxCharacters', () => {
      it('allows only last character typed if set to 1', () => {
        const fakeEvent = {target:{value:'abcdefg'}};
        const settings = {maxCharacters: 1};
        const component = mount(<TextField
          fieldName='mario'
          settings={ settings }/>);

        component.find('input').simulate('change', fakeEvent);

        expect(FakeContainerActions.changeContainer).toHaveBeenLastCalledWith('textField', 'mario', {value: 'g'})
      });

      it('allows only first n characters when set to n > 1', () => {
        const fakeEvent = {target:{value:'abcdefg'}};
        const settings = {maxCharacters: 2};
        const component = mount(<TextField
          fieldName='mario'
          settings={ settings }/>);

        component.find('input').simulate('change', fakeEvent);

        expect(FakeContainerActions.changeContainer).toHaveBeenLastCalledWith('textField', 'mario', {value: 'ab'})
      });
    });
  });
});
