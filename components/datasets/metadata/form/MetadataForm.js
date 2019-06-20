import React from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import { toastr } from 'react-redux-toastr';

// redux
import { connect } from 'react-redux';

// redactions
import { setSources, resetSources } from 'redactions/admin/sources';

// Service
import { fetchDataset, fetchFields } from 'services/dataset';

// Contants
import { STATE_DEFAULT, FORM_ELEMENTS } from 'components/datasets/metadata/form/constants';

// Components
import Navigation from 'components/form/Navigation';
import Step1 from 'components/datasets/metadata/form/steps/Step1';


class MetadataForm extends React.Component {
  constructor(props) {
    super(props);

    const newState = Object.assign({}, STATE_DEFAULT, {
      metadata: [],
      columns: [],
      loading: !!props.dataset,
      loadingColumns: true,
      form: Object.assign({}, STATE_DEFAULT.form, {
        application: props.application,
        authorization: props.authorization
      })
    });

    // -------------------- BINDING -----------------------
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onStepChange = this.onStepChange.bind(this);

    this.state = newState;
  }

  componentDidMount() {
    const { dataset, serSources } = this.props;
    const { form } = this.state;

    if (dataset) {
      fetchDataset(dataset,
        { 
          includes: 'metadata, layer'
        })
        .then((result) => {
          const { metadata, type, provider, tableName } = result;
          this.setState({
            form: (metadata && metadata.length) ?
              this.setFormFromParams(metadata[0]) : form,
            metadata,
            type: type || 'tabular',
            // Stop the loading
            loading: false
          });

          if (metadata[0]) {
            setSources(metadata[0].info.sources || []);
          }

          if (provider !== 'wms') {
            // fetchs column fields based on dataset type
            fetchFields({
              id: dataset,
              type,
              provider,
              tableName
            })
              .then((columns) => {
                this.setState({
                  columns,
                  loadingColumns: false
                });
              })
              .catch((err) => {
                this.setState({ loadingColumns: false });
              });
          } else {
            this.setState({ loadingColumns: false });
          }
        })
        .catch((err) => {
          this.setState({ loading: false });
          toastr.error('Error', err);
        });
    }
  }

  componentWillUnmount() {
    this.props.resetSources();
  }

  /**
   * UI EVENTS
   * - onSubmit
   * - onChange
  */
  onSubmit(event) {
    event.preventDefault();

    // Validate the form
    FORM_ELEMENTS.validate();

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      const valid = FORM_ELEMENTS.isValid();
      if (valid) {
        const { dataset } = this.props;
        const { metadata, form } = this.state;

        // Start the submitting
        this.setState({ submitting: true });

        // Check if the metadata alerady exists
        const thereIsMetadata = Boolean(metadata.find((m) => {
          const hasLang = m.attributes.language === form.language;
          const hasApp = m.attributes.application === form.application;

          return hasLang && hasApp;
        }));

        // Set the request
        const requestOptions = {
          type: (dataset && thereIsMetadata) ? 'PATCH' : 'POST',
          omit: ['authorization']
        };

        // Save the data
        this.service.saveMetadata({
          type: requestOptions.type,
          id: dataset,
          body: omit(this.state.form, requestOptions.omit)
        })
          .then(() => {
            toastr.success('Success', 'Metadata has been uploaded correctly');
            if (this.props.onSubmit) {
              this.props.onSubmit();
            }
          })
          .catch((err) => {
            this.setState({ submitting: false });
            toastr.error('Error', err);
          });
      } else {
        toastr.error('Error', 'Fill all the required fields or correct the invalid values');
      }
    }, 0);
  }

  onChange(obj) {
    const form = Object.assign({}, this.state.form, obj.form);
    this.setState({ form });
  }

  onStepChange(step) {
    this.setState({ step });
  }

  // HELPERS
  setFormFromParams(params) {
    const form = Object.keys(this.state.form);
    const newForm = {};

    form.forEach((f) => {
      if (params[f] || this.state.form[f]) {
        newForm[f] = params[f] || this.state.form[f];
      }
    });

    return newForm;
  }

  render() {
    const { loading, columns, type, form, loadingColumns, stepLength, submitting, step } = this.state;
    return (
      <div className="c-metadata-form">
        <form className="c-form" onSubmit={this.onSubmit} noValidate>
          {loading && 'loading'}
          {!loading &&
            <Step1
              onChange={value => this.onChange(value)}
              columns={columns}
              type={type}
              form={form}
              loadingColumns={loadingColumns}
            />
          }

          {!loading &&
            <Navigation
              step={step}
              stepLength={stepLength}
              submitting={submitting}
              onStepChange={this.onStepChange}
            />
          }
        </form>
      </div>
    );
  }
}

MetadataForm.propTypes = {
  dataset: PropTypes.string.isRequired,
  application: PropTypes.string.isRequired,
  authorization: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
  setSources: PropTypes.func,
  resetSources: PropTypes.func,
  locale: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
  locale: state.common.locale
});

const mapDispatchToProps = {
  setSources,
  resetSources
};

export default connect(mapStateToProps, mapDispatchToProps)(MetadataForm);
