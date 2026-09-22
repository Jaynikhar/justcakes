import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { SHOP } from '../utils/constants.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Contact() {
  useDocumentTitle('Contact');
  return (
    <div className="container page">
      <h1>Talk to the bakery</h1>
      <p>Custom flavours, bulk orders and delivery questions — reach us directly.</p>

      <div className="panel stack mt-2">
        {SHOP.phone ? (
          <p><Phone size={16} style={{ display: 'inline' }} /> <a href={`tel:${SHOP.phone}`}>{SHOP.phone}</a></p>
        ) : null}
        {SHOP.phone ? (
          <p>
            <MessageCircle size={16} style={{ display: 'inline' }} />{' '}
            <a href={`https://wa.me/${SHOP.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">
              Message us on WhatsApp
            </a>
          </p>
        ) : null}
        {SHOP.email ? (
          <p><Mail size={16} style={{ display: 'inline' }} /> <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a></p>
        ) : null}
        {SHOP.address ? <p><MapPin size={16} style={{ display: 'inline' }} /> {SHOP.address}</p> : null}
      </div>
    </div>
  );
}
