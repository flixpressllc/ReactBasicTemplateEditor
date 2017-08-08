import DropDown from './DropDown';
import './ImageDropDown.scss';
import PT from 'prop-types';

class ImageDropDown extends DropDown {
  constructor (props) {
    super(props);
    this.handleDropDownChange = this.handleDropDownChange.bind(this);
  }

  handleDropDownChange (e) {
    this.props.onChange(this.props.index, this.props.fieldName,  e.target.value);
  }
}

ImageDropDown.defaultProps = {
  options: [],
  fieldName: '',
  onDropDownFocus: () => {
    // Do nothing. This is not a main component.
    // Just overriding here from the base class.
  }
};

ImageDropDown.propTypes = {
  options: PT.array,
  fieldName: PT.string,
  index: PT.number.isRequired
}

export default ImageDropDown;
