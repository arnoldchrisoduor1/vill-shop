import Link from 'next/link';
import { ExternalLink, Mail, Phone, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[var(--color-text)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4">Vill Shop</h3>
            <p className="text-sm text-gray-400">Quality physical and digital products delivered to your door.</p>
            <div className="flex gap-4 mt-4">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><ExternalLink className="h-5 w-5" /></a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><Globe className="h-5 w-5" /></a>
              <a href="mailto:support@villshop.com" aria-label="Email" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><Mail className="h-5 w-5" /></a>
              <a href="tel:+254700000000" aria-label="Phone" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><Phone className="h-5 w-5" /></a>
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
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="mailto:support@villshop.com" className="hover:text-white transition-colors">support@villshop.com</a></li>
              <li><span>+254 700 000 000</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Vill Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
