import React from 'react';
import PropTypes from 'prop-types';
import TetherComponent from 'react-tether';
import classnames from 'classnames';

import { connect } from 'react-redux';
import { setTooltipPosition } from 'redactions/tooltip';

class Tooltip extends React.Component {
  constructor(props) {
    super(props);

    // Bindings
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  componentWillReceiveProps({ tooltip }) {
    if (tooltip.follow && tooltip.follow !== this.props.tooltip.follow) {
      document.addEventListener('mousemove', this.onMouseMove);
    }

    const stopFollowing = tooltip.follow === false && tooltip.follow !== this.props.tooltip.follow;
    const isEmpty = !tooltip.opened && tooltip.opened !== this.props.tooltip.opened;

    if (stopFollowing || isEmpty) {
      document.removeEventListener('mousemove', this.onMouseMove);
    }
  }

  onMouseMove({ clientX, clientY }) {
    this.props.setTooltipPosition({ x: window.scrollX + clientX, y: window.scrollY + clientY });
  }

  getContent() {
    return this.props.tooltip.children
      ? (
        <this.props.tooltip.children
          {...this.props.tooltip.childrenProps}
          onResize={() => this.tether && this.tether.position()}
        />
      )
      : null;
  }

  getStyles() {
    const topPos = this.props.tooltip.position.y;
    const bottomPos = this.props.tooltip.position.x;
    if (this.el) {
      // TODO: modify topPos and bottomPos for recalculating toooltip
      // position if it is out of viewport
    }
    return {
      position: 'absolute',
      top: `${topPos}px`,
      left: `${bottomPos}px`,
      width: '1px',
      height: '1px',
      visibility: 'hidden'
    };
  }

  render() {
    const direction = this.props.tooltip.direction;

    const tooltipClasses = classnames({
      'c-tooltip': true,
      '-hidden': !this.props.tooltip.opened,
      '-arrow-top': direction === 'top',
      '-arrow-bottom': direction === 'bottom'
    });

    return (
      <TetherComponent
        ref={(node) => { this.tether = node; }}
        attachment={`${direction} center`}
        targetAttachment="top center"
        constraints={[{
          // Don't use the "together attachement" without making sure
          // the tooltip doesn't disappear in an embedded widget when
          // the cursor is at the top of the iframe
          to: 'scrollParent'
        }]}
        classes={{
          element: tooltipClasses
        }}
        offset={`${(direction === 'bottom' ? 1 : -1) * 20}px 0`} // The offset is needed for the follow option
      >
        <div
          style={this.getStyles()}
        />
        { this.props.tooltip.opened &&
          <div ref={(node) => { this.el = node; }}>{this.getContent()}</div>
        }
      </TetherComponent>
    );
  }
}

Tooltip.propTypes = {
  // STORE
  tooltip: PropTypes.object,
  setTooltipPosition: PropTypes.func
};

const mapStateToProps = ({ tooltip }) => ({
  tooltip
});

const mapDispatchToProps = dispatch => ({
  setTooltipPosition: (pos) => { dispatch(setTooltipPosition(pos)); }
});

export default connect(mapStateToProps, mapDispatchToProps)(Tooltip);
