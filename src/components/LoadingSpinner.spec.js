import React from 'react';
import { shallow } from 'enzyme';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () =>{
  it('renders without crashing', () => {
  shallow(<LoadingSpinner />);
  });

  it('appears when active', () => {
    const component = shallow(<LoadingSpinner active={ true } />);
    expect(component.find('.reactBasicTemplateEditor-LoadingSpinner-spinner').length).toBe(1);
  });

  it('disappears when inactive', ()=>{
    const component = shallow(<LoadingSpinner active={ false } />);
    expect(component.find('.reactBasicTemplateEditor-LoadingSpinner-spinner').length).toBe(0);
  });

  it('assumes it is active if no props are passed in', () =>{
    const component = shallow(<LoadingSpinner />);
    expect(component.find('.reactBasicTemplateEditor-LoadingSpinner-spinner').length).toBe(1);
  });
});
