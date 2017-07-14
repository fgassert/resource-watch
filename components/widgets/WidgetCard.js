import React from 'react';
import PropTypes from 'prop-types';
import { Autobind } from 'es-decorators';
import { Router } from 'routes';

// Redux
import withRedux from 'next-redux-wrapper';
import { initStore } from 'store';

// Components
import Title from 'components/ui/Title';
import DatasetWidgetChart from 'components/app/explore/DatasetWidgetChart';

// Services
import WidgetService from 'services/WidgetService';


class WidgetCard extends React.Component {

  constructor(props) {
    super(props);

    this.widgetService = new WidgetService(null, {
      apiURL: process.env.WRI_API_URL
    });
  }


  /**
   * HELPERS
   * - getDescription
  */
  getDescription(_text) {
    let text = _text;
    if (typeof text === 'string' && text.length > 70) {
      text = text.replace(/^(.{70}[^\s]*).*/, '$1');
      return `${text}...`;
    }
    return text;
  }

  /*
  * UI EVENTS
  *
  * - handleRemoveWidget
  * - handleClick
  * - handleEmbed
  */
  @Autobind
  handleRemoveWidget() {
    const widgetId = this.props.widget.id;
    const widgetName = this.props.widget.attributes.name;
    if (confirm(`Are you sure you want to remove the widget: ${widgetName}?`)) {
      this.widgetService.removeUserWidget(widgetId, this.props.user.token)
        .then((response) => {
          this.props.onWidgetRemove();
        })
        .catch(err => console.log(err));
    }
  }
  @Autobind
  handleClick(event) {
    const { widget } = this.props;
    if (event.target.tagName !== 'A') {
      Router.pushRoute('myrw', { tab: 'widgets', subtab: 'my-widgets', element: widget.id });
    }
  }

  render() {
    const { widget } = this.props;

    return (
      <div
        className={'c-widget-card'}
        onClick={this.handleClick}
      >
        {widget &&
          <DatasetWidgetChart
            widget={widget.attributes}
          />
        }

        <div className="info">
          <div className="detail">
            {/* Title */}
            <Title className="-default -primary">
              {widget.attributes.name}
            </Title>
            <p>{this.getDescription(widget.attributes.description)}</p>
          </div>
          <div className="actions">
            <a
              className="c-button"
              onClick={this.handleRemoveWidget}
            >
            Remove
            </a>
            <a
              className="c-button"
              onClick={this.handleEmbed}
            >
            Embed
            </a>
          </div>

        </div>
      </div>
    );
  }
}

WidgetCard.propTypes = {
  widget: PropTypes.object.isRequired,
  // Callbacks
  onWidgetRemove: PropTypes.func.isRequired,
  // Store
  user: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  user: state.user
});

export default withRedux(initStore, mapStateToProps, null)(WidgetCard);
