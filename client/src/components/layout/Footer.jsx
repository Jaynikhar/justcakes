import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { SHOP } from '../../utils/constants.js';

export function Footer({ categories = [] }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <h4>Just Cakes</h4>
            <p style={{ color: '#e6d2c3', fontSize: '0.92rem' }}>
              Fresh baked with love. Order a cake and we bake it the same day.
            </p>
          </div>

          <div>
            <h4>Browse</h4>
            <ul className="footer__list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/cakes">All cakes</Link></li>
              <li><Link to="/about">About us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4>Categories</h4>
            <ul className="footer__list">
              {categories.length ? (
                categories.slice(0, 6).map((category) => (
                  <li key={category._id}>
                    <Link to={`/category/${category.slug}`}>{category.name}</Link>
                  </li>
                ))
              ) : (
                <li style={{ color: '#d7c2b2' }}>Categories appear once added</li>
              )}
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul className="footer__list">
              {SHOP.address ? (
                <li><MapPin size={14} style={{ display: 'inline' }} /> {SHOP.address}</li>
              ) : null}
              {SHOP.phone ? (
                <li><Phone size={14} style={{ display: 'inline' }} /> <a href={`tel:${SHOP.phone}`}>{SHOP.phone}</a></li>
              ) : null}
              {SHOP.email ? (
                <li><Mail size={14} style={{ display: 'inline' }} /> <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a></li>
              ) : null}
              {SHOP.instagram ? <li><a href={SHOP.instagram}>Instagram</a></li> : null}
              {SHOP.facebook ? <li><a href={SHOP.facebook}>Facebook</a></li> : null}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Just Cakes</span>
          {SHOP.developerName ? (
            <span>
              Built by {SHOP.developerName}
              {SHOP.developerContact ? ` · ${SHOP.developerContact}` : ''}
            </span>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
