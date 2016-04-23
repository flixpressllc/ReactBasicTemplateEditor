import Confirmation from '../components/Confirm';
import { createConfirmation } from 'react-confirm';

const confirm = createConfirmation(Confirmation);

export default function(confirmation, options = {}) {
  var obj = {confirmation};
  for (var key in options) {
    if (options.hasOwnProperty(key)){
      obj[key] = options[key];
    }
  }
  return confirm(obj);
}
