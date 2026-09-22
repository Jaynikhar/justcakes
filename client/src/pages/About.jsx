import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function About() {
  useDocumentTitle('About');
  return (
    <div className="container page">
      <h1>About Just Cakes</h1>
      <div className="panel stack">
        <p>
          Just Cakes is a home bakery. Every cake is baked to order — nothing sits in a display
          fridge waiting for a buyer. Signature flavours like pineapple, rasmalai and butterscotch
          come out of the same kitchen that handles custom decorations for birthdays and weddings.
        </p>
        <p>
          Order online, pay by UPI and upload the payment screenshot. You then follow the order
          through baking, packing and delivery from your profile page.
        </p>
        <div className="row">
          <Link to="/cakes" className="btn btn--primary">See the menu</Link>
          <Link to="/contact" className="btn btn--ghost">Ask about a custom cake</Link>
        </div>
      </div>
    </div>
  );
}
