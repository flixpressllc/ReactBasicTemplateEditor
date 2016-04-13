var styleVars = {
  multiplier: 12
};

var styles = {
  label: {
    display: 'block',
    marginTop: '0.5em'
  },
  previewImage: {
    border: '1px solid black',
    margin: '1em',
    float: 'left',
    width: (16 * styleVars.multiplier) + 'px',
    height: (9 * styleVars.multiplier) + 'px',
    textAlign: 'center',
    fontSize: (1.6 * styleVars.multiplier) + 'px',
    color: 'white',
    textShadow: '0 0 4px black',
    backgroundSize: 'contain'
  },
  messages: {
    error: {
      color: 'red'
    }
  }
};

export {styleVars, styles};