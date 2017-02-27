import React, { Component, PropTypes as PT } from 'react';
import { mediaWidth } from '../utils/helper-functions';
import cx from 'classnames';
import './ColumnScroller.scss';

const MAX_WIDTH = 850;
const COLUMN_BREAK_WIDTH = 670;

class ColumnScroller extends Component {
  constructor (props) {
    super(props);
    this.state = {
      columnWidth: false
    }

    this.checkWidth = this.checkWidth.bind(this);
  }

  componentDidMount() {
    if (window) {
      window.addEventListener('resize', this.checkWidth);
    }
    this.checkWidth();
  }

  componentWillUnmount() {
    if (window) {
      window.removeEventListener('resize', this.checkWidth);
    }
  }

  widthIsBetweenBreakAndMax() {
    return COLUMN_BREAK_WIDTH <= mediaWidth() && mediaWidth() < MAX_WIDTH;
  }

  checkWidth() {
    if (!this.shouldUseColumns()) {
      if (this.state.columnWidth !== false) {
        this.setState({
          columnWidth: false,
          marginLeft: false
        });
      }
    } else if (this.widthIsBetweenBreakAndMax()) {
      this.setState({
        columnWidth: this.getColumnWidth(),
        marginLeft: this.getColumnWidth()
      });
    } else {
      if (this.state.columnWidth !== this.getColumnWidth()) {
        this.setState({
          columnWidth: this.getColumnWidth(),
          marginLeft: false
        });
      }
    }
  }

  getAvailableWidth() {
    return Math.min(mediaWidth(), MAX_WIDTH);
  }

  shouldUseColumns() {
    return this.getAvailableWidth() >= COLUMN_BREAK_WIDTH;
  }

  getColumnWidth() {
    return this.getAvailableWidth() / 2
  }

  render() {
    const className = cx(
      'reactBasicTemplateEditor-ColumnScroller',
      this.props.className
    );
    const children = this.props.children.map((child, i) => {
      let style = {};
      if (this.state.columnWidth) {
        style.maxWidth = this.state.columnWidth;
      }
      if (i === 1 && this.state.marginLeft) {
        style.marginLeft = this.state.marginLeft;
      }
      return (
        <div
          className="reactBasicTemplateEditor-ColumnScroller-column"
          style={ style }
          key={i}>
          { child }
        </div>
      );
    })
    return (
      <div className={ className }>
        { children }
      </div>
    );
  }
}

export default ColumnScroller;