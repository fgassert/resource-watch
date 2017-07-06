import React from 'react';
import PropTypes from 'prop-types';

// Redux
import withRedux from 'next-redux-wrapper';
import { initStore } from 'store';

// Components
import WidgetTable from 'components/admin/widget/table/WidgetTable';
import ButtonContainer from 'components/ui/ButtonContainer';
import Title from 'components/ui/Title';
import Layout from 'components/admin/layout/Layout';

export default class WidgetIndex extends React.Component {

  static async getInitialProps({ query }) {
    const datasetID = query.id;
    return { datasetID };
  }

  render() {
    const { datasetID } = this.props;
    return (
      <Layout
        title="Dataset widgets"
        description="Dataset widgets description"
      >
        <div className="row">
          <div className="column small-12">
            <Title className="-huge -p-primary">
              Widgets
            </Title>

            <ButtonContainer
              className="-j-end"
              buttons={[{
                label: 'New +',
                path: `/admin/datasets/${datasetID}/widgets/new`,
                className: ''
              }]}
            />

            <WidgetTable
              application={['rw']}
              dataset={datasetID}
              authorization={this.props.user.token}
            />
          </div>
        </div>
      </Layout>
    );
  }
}

WidgetIndex.propTypes = {
  // Store
  user: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  user: state.user
});

export default withRedux(initStore, mapStateToProps, null)(WidgetIndex);
