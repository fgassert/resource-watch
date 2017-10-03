import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import d3 from 'd3';

// Redux
import withRedux from 'next-redux-wrapper';
import { initStore } from 'store';
import { bindActionCreators } from 'redux';
import { getWidget } from 'redactions/widget';

// Components
import Page from 'components/app/layout/Page';
import EmbedLayout from 'components/app/layout/EmbedLayout';
import VegaChart from 'components/widgets/charts/VegaChart';
import Spinner from 'components/ui/Spinner';
import ChartTheme from 'utils/widgets/theme';

class EmbedWidget extends Page {
  static getInitialProps(context) {
    const props = super.getInitialProps(context);

    const { req, isServer } = context;
    const referer = isServer ? req.headers.referer : location.href;

    return { ...props, referer, isLoading: true };
  }

  isLoadedExternally() {
    return !/localhost|staging.resourcewatch.org/.test(this.props.referer);
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: props.isLoading
    };
  }

  componentDidMount() {
    this.props.getWidget(this.props.url.query.id);
  }

  render() {
    const { widget, loading, bandDescription, bandStats } = this.props;
    const { isLoading } = this.state;

    if (loading) {
      return (
        <EmbedLayout
          title={'Loading widget...'}
          description={''}
        >
          <Spinner isLoading className="-light" />
        </EmbedLayout>
      );
    }

    return (
      <EmbedLayout
        title={`${widget.attributes.name}`}
        description={`${widget.attributes.description || ''}`}
      >
        <div className="c-embed-widget">
          <div className="visualization">
            <Spinner isLoading={isLoading} className="-light" />
            <div className="widget-title">
              <h4>{widget.attributes.name}</h4>
            </div>
            <div className="widget-content">
              <VegaChart
                height={300}
                data={widget.attributes.widgetConfig}
                theme={ChartTheme()}
                toggleLoading={l => this.setState({ isLoading: l })}
                reloadOnResize
              />
            </div>
            <p className="widget-description">
              {widget.attributes.description}
            </p>
          </div>
          { bandDescription && (
            <div className="band-information">
              {bandDescription}
            </div>
          ) }
          {!isEmpty(bandStats) && (
            <div className="c-table">
              <table>
                <thead>
                  <tr>
                    { Object.keys(bandStats).map(name => <th key={name}>{name}</th>) }
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    { Object.keys(bandStats).map((name) => {
                      const number = d3.format('.4s')(bandStats[name]);
                      return (
                        <td key={name}>{number}</td>
                      );
                    }) }
                  </tr>
                </tbody>
              </table>
            </div>
          ) }
          { this.isLoadedExternally() &&
            <img
              className="embed-logo"
              height={21}
              width={129}
              src={'/static/images/logo-embed.png'}
              alt="Resource Watch"
            /> }
        </div>
      </EmbedLayout>
    );
  }
}

EmbedWidget.propTypes = {
  widget: PropTypes.object,
  getWidget: PropTypes.func,
  bandDescription: PropTypes.string,
  bandStats: PropTypes.object,
  loading: PropTypes.bool
};

EmbedWidget.defaultProps = {
  widget: {}
};

const mapStateToProps = state => ({
  widget: state.widget.data,
  loading: state.widget.loading,
  bandDescription: state.widget.bandDescription,
  bandStats: state.widget.bandStats
});

const mapDispatchToProps = dispatch => ({
  getWidget: bindActionCreators(getWidget, dispatch)
});

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(EmbedWidget);
