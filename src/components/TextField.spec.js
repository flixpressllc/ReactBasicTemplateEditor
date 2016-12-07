import React from 'react';
import { mount, render, shallow } from 'enzyme';
import TextField from './TextField';

const minimumSettings = {value:""}

describe('TextField', () => {
  it('renders without crashing', () => {
    expect(() => mount(
      <TextField settings={ minimumSettings }/>
    )).not.toThrow();
  });

  it('displays its name in the label', () => {
    const component = render(<TextField fieldName='mario' settings={ minimumSettings }/>)
    
    expect(component.find('label').text()).toEqual('mario');
  });
  
  it('calls the onUserInput function when text is altered', () => {
    const fakeEvent = {target:{value:'new value'}};
    const fakeFn = jest.fn(() => {});
    const component = shallow(<TextField onUserInput={ fakeFn } settings={ minimumSettings }/>)

    component.find('input').simulate('change', fakeEvent);
    
    expect(fakeFn).toHaveBeenCalled();
  });

  it('calls the onTextFieldFocus function when the input field is focused', () => {
    const fakeFn = jest.fn(() => {});
    const component = shallow(<TextField onTextFieldFocus={ fakeFn }
      fieldName='Name of this field'
      settings={ minimumSettings }/>)

    component.find('input').simulate('focus');
    
    expect(fakeFn).toHaveBeenCalledWith('Name of this field');
  });
  
  describe('filter options', () => {
    describe('maxCharacters', () => {
      it('allows only last character typed if set to 1', () => {
        const fakeEvent = {target:{value:'new value'}};
        const fakeFn = jest.fn(() => {});
        let settings = minimumSettings;
        settings.maxCharacters = 1;
        const component = shallow(<TextField
          fieldName='mario'
          onUserInput={ fakeFn }
          settings={ minimumSettings }/>);
        
        component.find('input').simulate('change', fakeEvent);
        
        expect(fakeFn).toHaveBeenCalledWith('mario', 'e');
      });

      it('allows only first n characters when set to n > 1', () => {
        const fakeEvent = {target:{value:'new value'}};
        const fakeFn = jest.fn(() => {});
        let settings = minimumSettings;
        settings.maxCharacters = 2;
        const component = shallow(<TextField
          fieldName='mario'
          onUserInput={ fakeFn }
          settings={ minimumSettings }/>);
        
        component.find('input').simulate('change', fakeEvent);
        
        expect(fakeFn).toHaveBeenCalledWith('mario', 'ne');
      });
    });
  });
});
