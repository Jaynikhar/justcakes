import { NavLink } from 'react-router-dom';

const links = [
  { to: '/owner', label: 'Overview', end: true },
  { to: '/owner/orders', label: 'Orders' },
  { to: '/owner/products', label: 'Products' },
  { to: '/owner/categories', label: 'Categories' },
  { to: '/owner/slides', label: 'Slideshow' },
  { to: '/owner/reviews', label: 'Reviews' },
];

export function OwnerNav() {
  return (
    <nav className="owner-nav" aria-label="Owner sections">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => (isActive ? 'is-active' : '')}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default OwnerNav;
