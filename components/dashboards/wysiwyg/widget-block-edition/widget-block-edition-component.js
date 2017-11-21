import React from 'react';
import PropTypes from 'prop-types';

// Components
import Tabs from 'components/ui/Tabs';
import Spinner from 'components/ui/Spinner';
import WidgetList from 'components/widgets/list/WidgetList';

export default function WidgetBlockEdition({ data, onChangeTab, onSelect }) {
  return (
    <div className="c-dashboard-widget-edition">
      <div className="l-page">
        <div className="c-page-header -admin">
          <div className="row">
            <div className="column small-12">
              <div className="page-header-content -with-tabs">
                <h1>Select widget</h1>
                <Tabs
                  options={[
                    { label: 'My widgets', value: 'my-widgets' },
                    { label: 'All widgets', value: 'all-widgets' }
                  ]}
                  defaultSelected={data.tab}
                  selected={data.tab}
                  onChange={onChangeTab}
                />
              </div>
            </div>
          </div>
        </div>

        <Spinner isLoading={data.loading} className="-light" />

        <div className="c-page-section dock-widget-container">
          <WidgetList
            widgets={data.widgets}
            mode="grid"
            onWidgetClick={(w) => console.info(w)}
          />
        </div>
      </div>
    </div>
  );
}

WidgetBlockEdition.propTypes = {
  data: PropTypes.object,
  user: PropTypes.object,
  onChangeTab: PropTypes.func,
  onSelect: PropTypes.func
};

WidgetBlockEdition.defaultProps = {
  data: {},
  user: {},
  onChangeTab: null,
  onSelect: null
};
