import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'routes';
import CompoundMenu from 'components/ui/CompoundMenu';
import Carousel from 'components/ui/Carousel';
import { getPartners } from 'redactions/admin/partners';

import { connect } from 'react-redux';

const data = [
  { name: 'Data', route: 'explore' },
  { name: 'Explore Datasets', route: 'explore' },
  { name: 'Dashboards', route: 'dashboards' },
  { name: 'Planet Pulse', route: 'pulse' },
  { name: 'Explore Tools', route: 'get_involved' }
];

const about = [
  { name: 'About', route: 'about' },
  { name: 'Partners', route: 'about_partners' },
  { name: 'Terms of Service', route: 'terms-of-service' },
  { name: 'Privacy', route: 'privacy-policy' }
];

const insights = [
  { name: 'Blog', route: 'blog' },
  { name: 'Recent stories' },
  { name: 'Highlighted stories' }
];

const getInvolved = [
  { name: 'Get involved', route: 'get_involved' },
  { name: 'Submit an insight', route: 'get_involved_detail', params: { id: 'submit-an-insight' } },
  { name: 'Contribute data', route: 'get_involved_detail', params: { id: 'contribute-data' } },
  { name: 'Join the community', route: 'get_involved_detail', params: { id: 'join-community' } }
];

class Footer extends React.Component {
  componentDidMount() {
    this.props.getPartners();
  }

  setPartnersList() {
    const featured = this.props.partners.filter(p => p.featured);

    return featured.map(p => (
      <div key={p.id} className="item">
        <Link route="partner" params={{ id: p.id }}>
          <a>
            <img className="-img" src={`${process.env.STATIC_SERVER_URL}${p.logo.thumb}`} alt={p.name} />
          </a>
        </Link>
      </div>
    ));
  }

  render() {
    const menuData = [data, about, insights, getInvolved];
    const items = this.setPartnersList();

    return (
      <footer className="l-footer">
        <div className="footer-main">
          <div className="l-container">
            <div className="row">
              <div className="column small-12">
                <img
                  className="footer-logo"
                  height={21}
                  width={129}
                  src={'/static/images/logo-embed.png'}
                  alt="Resource Watch"
                />
              </div>
            </div>
          </div>
          <CompoundMenu items={menuData} />
        </div>

        <div className="footer-intro">
          <div className="title">
            <Link route="about_partners"><a>Partners</a></Link>
          </div>
          <div className="l-container">
            <div className="row">
              <div className="column small-12">
                <div className="c-partners-slider">
                  {items.length ? <Carousel items={items} /> : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-lower">
          <div className="l-container">
            <div className="row">
              <div className="column small-12">
                <div className="footer-container">
                  <div className="footer-item">
                    <a href="http://www.wri.org/" target="_blank" rel="noreferrer noopener">
                      <img src="/static/images/wri-logo.svg" alt="WRI logo" />
                    </a>
                  </div>
                  <div className="footer-item">
                    <p className="-bold">World Resources Institute</p>
                    <p>10 G Street NE Suite 800, Washington, DC 20002, USA</p>
                    <p>Phone +1(202) 729-7600    |    Fax: +1 (202) 720 7610</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

Footer.propTypes = {
  getPartners: PropTypes.func,
  partners: PropTypes.array
};

const mapStateToProps = state => ({
  partners: state.partners.partners.list
});

const mapDispatchToProps = dispatch => ({
  getPartners: () => { dispatch(getPartners()); }
});

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
