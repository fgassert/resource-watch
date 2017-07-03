import React from 'react';

// Redux
import withRedux from 'next-redux-wrapper';
import { initStore } from 'store';
import { resetDataset, toggleLayerShown } from 'redactions/exploreDetail';
import updateLayersShown from 'selectors/explore/layersShownExploreDetail';

// Next
import { Router } from 'routes';
import { Link } from 'routes';

// Services
import DatasetService from 'services/DatasetService';

// Components
import Page from 'components/app/layout/Page';
import Layout from 'components/app/layout/Layout';
import Title from 'components/ui/Title';
import Breadcrumbs from 'components/ui/Breadcrumbs';
import Spinner from 'components/ui/Spinner';
import WidgetEditor from 'components/widgets/WidgetEditor';
// import DatasetList from 'components/app/explore/DatasetList';

class ExploreDetail extends Page {
  constructor(props) {
    super(props);

    this.state = {
      similarDatasetsLoaded: false,
      dataset: null,
      loading: false
    };

    // DatasetService
    this.datasetService = new DatasetService(this.props.url.query.id, {
      apiURL: process.env.WRI_API_URL
    });
  }

  /**
   * Component Lifecycle
   * - componentDidMount
   * - componentWillReceiveProps
   * - componentWillUnmount
  */
  componentDidMount() {
    super.componentDidMount();
    this.getDataset();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.url.query.id !== nextProps.url.query.id) {
      this.props.resetDataset();
      this.setState({
        similarDatasetsLoaded: false,
        datasetRawDataLoaded: false,
        datasetLoaded: false
      }, () => {
        this.getDataset();
      });
    }
  }

  componentWillUnmount() {
    this.props.resetDataset();
  }

  /**
   * HELPERS
   * - getDataset
  */
  getDataset() {
    this.setState({
      loading: true
    }, () => {
      this.datasetService.fetchData('layer,metadata').then((response) => {
        this.setState({
          dataset: response,
          datasetLoaded: true,
          loading: false
        });
      }).catch((error) => {
        console.error(error);
        this.setState({
          loading: false
        });
      });
    });
  }

  /**
   * UI EVENTS
   * - triggerDownload
  */
  triggerDownload() {
    console.info('triggerDownload');
  }

  triggerLaunchPlanetPulse() {
    Router.pushRoute('pulse');
  }

  render() {
    const { dataset, loading } = this.state;
    const metadata = dataset && dataset.attributes.metadata;

    return (
      <Layout
        title="Explore detail"
        description="Explore detail description..."
        user={this.props.user}
        pageHeader
      >
        <div className="c-page-explore-detail">
          <Spinner
            isLoading={loading}
            className="-fixed -light"
          />

          {/* PAGE HEADER */}
          <div className="c-page-header">
            <div className="l-container">
              <div className="page-header-content -padding-b-2">
                <Breadcrumbs
                  items={[{ name: 'Explore datasets', url: 'explore' }]}
                />

                <Title className="-primary -huge page-header-title" >
                  { dataset && dataset.attributes && dataset.attributes.name}
                </Title>

                <div className="page-header-info">
                  <ul>
                    <li>Source: {(metadata && metadata.length > 0 && metadata[0].source) || '-'}</li>
                    <li>Last update: {dataset && dataset.attributes && new Date(dataset.attributes.updatedAt).toJSON().slice(0, 10).replace(/-/g, '/')}</li>
                    {/* Favorites <li>Last update: {dataset && dataset.attributes && dataset.attributes.updatedAt}</li> */}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* WIDGET EDITOR */}
          {dataset &&
            <WidgetEditor
              dataset={dataset.id}
            />
          }

          {/* DATASET INFO && ACTIONS */}
          <div className="c-page-section">
            <section className="c-dataset-info">
              <div className="row">
                <div className="column small-12 medium-7">
                  {/* Description */}
                  <div className="dataset-info-description">
                    {metadata && (metadata.length > 0) && metadata[0].attributes.description &&
                      metadata[0].attributes.description
                    }
                  </div>
                </div>
                <div className="column large-offset-2 small-3">
                  <div className="dataset-info-actions">
                    <div className="row flex-dir-column">
                      <div className="column">
                        <button
                          disabled
                          className="c-button -primary -fullwidth -disabled"
                          onClick={this.triggerDownload}
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>


          {/* RELATED TOOLS */}

          {/* SIMILAR DATASETS */}

          {/* RELATED INSIGHTS */}

          {/* PLANET PULSE */}
          <div className="c-page-section pulse-banner-section">
            <div className="row">
              <div className="column small-12">
                <div className="pulse-banner">
                  <h1>Planet Pulse</h1>
                  <div className="pulse-banner-container">
                    <div className="action-container">
                      <h1>Take the pulse of our planet</h1>
                      <button
                        disabled
                        className="c-button -primary"
                        onClick={this.triggerLaunchPlanetPulse}
                      >
                        Launch planet pulse
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

ExploreDetail.propTypes = {
  url: React.PropTypes.string.isRequired,
  // ACTIONS
  resetDataset: React.PropTypes.func
};

const mapStateToProps = state => ({
  exploreDetail: state.exploreDetail,
  layersShown: updateLayersShown(state)
});

const mapDispatchToProps = dispatch => ({
  resetDataset: () => {
    dispatch(resetDataset());
  },
  toggleLayerShown: (id) => {
    dispatch(toggleLayerShown(id));
  }
});

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(ExploreDetail);
