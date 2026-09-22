import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import OwnerRoute from './routes/OwnerRoute.jsx';

import Home from './pages/Home.jsx';
import Cakes from './pages/Cakes.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';

import Checkout from './pages/Checkout.jsx';
import OrderPlaced from './pages/OrderPlaced.jsx';
import Profile from './pages/Profile.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetails from './pages/OrderDetails.jsx';

import OwnerDashboard from './pages/owner/OwnerDashboard.jsx';
import OwnerOrders from './pages/owner/OwnerOrders.jsx';
import OwnerOrderDetails from './pages/owner/OwnerOrderDetails.jsx';
import OwnerProducts from './pages/owner/OwnerProducts.jsx';
import OwnerProductForm from './pages/owner/OwnerProductForm.jsx';
import OwnerCategories from './pages/owner/OwnerCategories.jsx';
import OwnerSlides from './pages/owner/OwnerSlides.jsx';
import OwnerReviews from './pages/owner/OwnerReviews.jsx';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/cakes" element={<Cakes />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:idOrSlug" element={<ProductDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Signed-in customer */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout/:idOrSlug" element={<Checkout />} />
            <Route path="/order-placed/:id" element={<OrderPlaced />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/orders" element={<Orders />} />
            <Route path="/profile/orders/:id" element={<OrderDetails />} />
          </Route>

          {/* Owner */}
          <Route element={<OwnerRoute />}>
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/owner/orders" element={<OwnerOrders />} />
            <Route path="/owner/orders/:id" element={<OwnerOrderDetails />} />
            <Route path="/owner/products" element={<OwnerProducts />} />
            <Route path="/owner/products/new" element={<OwnerProductForm />} />
            <Route path="/owner/products/:id/edit" element={<OwnerProductForm />} />
            <Route path="/owner/categories" element={<OwnerCategories />} />
            <Route path="/owner/slides" element={<OwnerSlides />} />
            <Route path="/owner/reviews" element={<OwnerReviews />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
