import DropDown from './DropDown';
import './ImageDropDown.scss';

class ImageDropDown extends DropDown {
  constructor (props) {
    super(props);
    this.handleDropDownChange = this.handleDropDownChange.bind(this);
  }

  handleDropDownChange (e) {
    // console.log(e);
    // ContainerActions.changeContainer(DATA_TYPE_NAME, this.props.fieldName, {value: e.target.value});
    // setTimeout(() => this.props.onDropDownFocus(this.props.fieldName), 100); // TODO: fix this hack
  }
}

ImageDropDown.defaultProps = {
  options: [],
  fieldName: '',
  onDropDownFocus: () => {
    // Do nothing. This is not a main component.
  }
};

export default ImageDropDown;
