import React from 'react';
import { mount, render, shallow } from 'enzyme';
import TextBox from './TextBox';


describe('TextBox', () => {
  it('renders without crashing', () => {
    expect(() => mount(
      <TextBox />
    )).not.toThrow();
  });

  it('displays its name in the label', () => {
    const component = render(<TextBox fieldName='mario' userText={ 'text' }/>)
    
    expect(component.find('label').text()).toEqual('mario');
  });
  
  it('displays the value in the textarea', () => {
    const component = render(<TextBox fieldName='mario' userText={ 'My Text' }/>)
    
    expect(component.find('textarea').val()).toEqual('My Text');
  });
  
  it('calls the onUserInput function when text is altered', () => {
    const fakeEvent = {target:{value:'new value'}};
    const fakeFn = jest.fn(() => {});
    const component = shallow(<TextBox onUserInput={ fakeFn } userText={ 'text' }/>)

    component.find('textarea').simulate('change', fakeEvent);
    
    expect(fakeFn).toHaveBeenCalled();
  });

  it('calls the onTextBoxFocus function when the input field is focused', () => {
    const fakeFn = jest.fn(() => {});
    const component = shallow(<TextBox onTextBoxFocus={ fakeFn }
      fieldName='Name of this field'
      userText={ 'text' }/>)

    component.find('textarea').simulate('focus');
    
    expect(fakeFn).toHaveBeenCalledWith('Name of this field');
  });
  
});
