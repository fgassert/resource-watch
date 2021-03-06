import React from 'react';
import PropTypes from 'prop-types';
import { Autobind } from 'es-decorators';
import { Router } from 'routes';
import { toastr } from 'react-redux-toastr';

// Redux
import { connect } from 'react-redux';

// Services
import WidgetService from 'services/WidgetService';

// Components
import Spinner from 'components/ui/Spinner';
import WidgetList from 'components/widgets/list/WidgetList';
import Icon from 'components/ui/Icon';

class DatasetWidgets extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      widgetsLoaded: false,
      widgets: [],
      mode: 'grid',
      orderDirection: 'asc'
    };

    // User service
    this.widgetService = new WidgetService(null, { apiURL: process.env.CONTROL_TOWER_URL });
  }

  componentDidMount() {
    this.loadWidgets();
  }

  @Autobind
  setMode(value) {
    this.setState({
      mode: value
    });
  }

  loadWidgets() {
    const { orderDirection } = this.state;
    const { dataset } = this.props;
    this.setState({
      widgetsLoaded: false
    });
    this.widgetService.getUserWidgets(this.props.user.id, true, orderDirection)
      .then((response) => {
        this.setState({
          widgetsLoaded: true,
          widgets: response.filter(widget => widget.attributes.dataset === dataset)
        });
      }).catch(err => toastr.error('Error', err));
  }

  @Autobind
  handleWidgetRemoved() {
    this.loadWidgets(this.props);
  }

  @Autobind
  handleOrderChange() {
    const newOrder = this.state.orderDirection === 'asc' ? 'desc' : 'asc';
    this.setState({
      orderDirection: newOrder
    },
    () => this.loadWidgets());
  }

  render() {
    const {
      widgetsLoaded,
      widgets,
      mode,
      orderDirection
    } = this.state;
    const { dataset } = this.props;

    return (
      <div className="c-dataset-widgets">
        <div className="row">
          <div className="column small-12">
            <div className="list-actions">
              <div className="left-container">
                <button
                  className="c-btn -a"
                  onClick={() => Router.pushRoute('myrw_detail', { tab: 'widgets', id: 'new', datasetId: dataset })}
                >
                  New widget
                </button>
              </div>
              <div className="buttons-container">
                <div
                  role="button"
                  tabIndex={0}
                  className="last-modified-container"
                  onClick={this.handleOrderChange}
                >
                  <a>
                    Last modified
                  </a>
                  {orderDirection === 'asc' &&
                    <Icon className="-small" name="icon-arrow-up" />
                  }
                  {orderDirection === 'desc' &&
                    <Icon className="-small" name="icon-arrow-down" />
                  }
                </div>
                <div className="mode-buttons">
                  <button
                    className={(mode === 'grid' ? '-active' : '')}
                    onClick={() => this.setMode('grid')}
                    title="Grid view"
                  >
                    <Icon name="icon-view-grid" />
                  </button>
                  <button
                    className={(mode === 'list' ? '-active' : '')}
                    onClick={() => this.setMode('list')}
                    title="List view"
                  >
                    <Icon name="icon-list-mode" />
                  </button>
                </div>
              </div>
            </div>
            <Spinner
              isLoading={!widgetsLoaded}
              className="-fixed -light"
            />
            {widgets &&
            <WidgetList
              widgets={widgets}
              mode={mode}
              onWidgetRemove={this.handleWidgetRemoved}
              showActions
              showRemove
            />
            }
            {widgets && widgets.length === 0 &&
            <div className="no-widgets-div">
              This dataset has no widgets yet
            </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

DatasetWidgets.propTypes = {
  dataset: PropTypes.string.isRequired,
  // Store
  user: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps, null)(DatasetWidgets);
