import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { fetchCategories } from '../../api/category.api.js';

export function Layout() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let active = true;
    fetchCategories()
      .then(({ data }) => {
        if (active) setCategories(data.data.categories);
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Navbar />
      <main id="main">
        <Outlet context={{ categories }} />
      </main>
      <Footer categories={categories} />
    </>
  );
}

export default Layout;
