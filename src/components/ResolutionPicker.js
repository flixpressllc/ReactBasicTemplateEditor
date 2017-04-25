import React from 'react';
import RadioGroup from './lib/RadioGroup';
import './ResolutionPicker.scss';

const ResolutionPicker = (props) => {
  var checked = props.chosen.toString();

  var options = props.resolutionOptions.map(resObj => {
    return {
      id: resObj.id.toString(),
      name: resObj.name
    };
  });

  return (
    <div className="reactBasicTemplateEditor-ResolutionPicker">
      <h3 className="reactBasicTemplateEditor-ResolutionPicker-title">Choose Resolution</h3>
      <RadioGroup className="reactBasicTemplateEditor-ResolutionPicker-radioGroup"
        options={ options }
        value={ checked }
        valueName="id"
        labelName="name"
        onChange={ value => { props.resolutionIdChange(parseInt(value,10)) } }
      />
    </div>
  );
}

ResolutionPicker.defaultProps = { resolutionOptions: [] };

export default ResolutionPicker;
