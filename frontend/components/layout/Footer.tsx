import Link from 'next/link';
import { ExternalLink, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { CONTACT } from '../../lib/constants';

export function Footer() {
  const primaryPhone = CONTACT.phones[0].replace(/\s+/g, '');

  return (
    <footer className="bg-[var(--color-text)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4">Vill Shop</h3>
            <p className="text-sm text-gray-400">
              Quality home furnishings from Villa Allegra — lights, furniture, kitchen fittings, and appliances.
            </p>
            <div className="flex gap-4 mt-4">
              <a
                href="https://www.villa-allegra.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Villa Allegra website"
                className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                aria-label="Email"
                className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href={`tel:${primaryPhone}`}
                aria-label="Phone"
                className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
              >
                <Phone className="h-5 w-5" />
              </a>
              <a
                href="https://www.villa-allegra.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Villa Allegra"
                className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/products?type=digital" className="hover:text-white transition-colors">Digital Products</Link></li>
              <li><Link href="/events" className="hover:text-white transition-colors">Events</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/account" className="hover:text-white transition-colors">My Account</Link></li>
              <li><Link href="/account/orders" className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link href="/account/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href={`mailto:${CONTACT.email}`} className="hover:text-white transition-colors">
                  {CONTACT.email}
                </a>
              </li>
              {CONTACT.phones.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                    {phone}
                  </a>
                </li>
              ))}
              {CONTACT.locations.map((location) => (
                <li key={location.city} className="flex gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-gray-500" />
                  <span>
                    <span className="text-gray-300">{location.city}</span>
                    <br />
                    {location.address}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Villa Allegra · All rights reserved
        </div>
      </div>
    </footer>
  );
}
