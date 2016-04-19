import React from 'react';

import {RadioGroup} from './imports';
import {styles} from '../styles/styles.js';

var Message = React.createClass({
  render: function () {
    return (
      <div style={styles.messages[this.props.type]}>
        {this.props.message}
      </div>
    )
  }
});

var Errors = React.createClass({
  emptyStyle: {display: 'none'},
  
  render: function () {
    var caughtErrorsArr = this.props.caughtErrors;
    var errors = [];

    for (var i = 0; i < caughtErrorsArr.length; i++) {
      errors.push(
        <Message key={i} message={caughtErrorsArr[i].message} type="error" />
      );
    }

    if (errors.length !== 0) {
      return (<div>{errors}</div>)
    } else {
      return (<div style={this.emptyStyle}></div>);
    }
  }
});

var SubmitRender = React.createClass({
  componentWillMount: function () {
    // Remove old submit button
    $('input[name="Submit_BT"]').remove();
  },
  render: function () {
    var text = (this.props.isPreview) ? 'Render Preview' : 'Submit Order'
    return (
      <input name="Submit_BT" value={text} type="submit" id="Submit_BT" />
    )
  }
});

var ResolutionPicker = React.createClass({
  handleResolutionChange: function (value) {
    this.props.resolutionIdChange(parseInt(value,10));
  },
  render: function () {
    var resolutionOptions = this.props.resolutionOptions;
    if (resolutionOptions === undefined){
      resolutionOptions = [];
    }
    var checked = this.props.chosen.toString();
    var options = resolutionOptions.map(function (resObj){
      return {
        id: resObj.id.toString(),
        name: resObj.name
      };
    })
    var messageStyle = {
      visibility: (this.props.disabled ? 'visible' : 'hidden')
    };
    return (
      <div>
        <RadioGroup
          options={options}
          value={checked}
          valueName="id"
          labelName="name"
          onChange={this.handleResolutionChange}
        />
        <div style={messageStyle}>
          Previews render at 360p with a watermark.
          Choosing a resolution for a preview will allow you
          to order your desired resolution right from the
          Previews tab of the My Account page.
        </div>
      </div>
    );
  }
});



export {Message, Errors, SubmitRender, ResolutionPicker};