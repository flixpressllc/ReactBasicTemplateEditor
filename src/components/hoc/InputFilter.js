import React, { Component, PropTypes as PT } from 'react';

const defaultProps = {
  settings: {}
};

const propTypes = {
  settings: PT.object.isRequired
}

function InputFilterHOC (WrappedComponent) {
  class InputFilter extends Component {
    constructor (props) {
      super(props);
      this.characterLimit = this.characterLimit.bind(this);
      this.filterInput = this.filterInput.bind(this);
    }
    filterInput (input) {
      return this.characterLimit(input);
    }

    characterLimit (string) {
      let limit = this.props.settings.maxCharacters;
      if (!limit || limit <= 0) return string;
      if (limit === 1) {
        return string.charAt(string.length - 1);
      }
      return string.slice(0, this.props.settings.maxCharacters);
    }

    render () {
      return (
        <WrappedComponent
          filterInput={ this.filterInput }
          {...this.props} />
      )
    }
  }

  InputFilter.defaultProps = defaultProps;
  InputFilter.propTypes = propTypes;

  return InputFilter;

}

export default InputFilterHOC;