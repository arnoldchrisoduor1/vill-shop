import Link from 'next/link';
import { ShoppingBag, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  shop: [
    { href: '/products', label: 'All Products' },
    { href: '/products?is_on_sale=true', label: 'Sale' },
    { href: '/products?is_new=true', label: 'New Arrivals' },
    { href: '/events', label: 'Events' },
  ],
  account: [
    { href: '/account', label: 'My Account' },
    { href: '/account/orders', label: 'Orders' },
    { href: '/account/wishlist', label: 'Wishlist' },
    { href: '/cart', label: 'Cart' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-primary">
              <ShoppingBag className="h-6 w-6" />
              Vill Shop
            </Link>
            <p className="mt-3 text-sm text-muted">
              Premium products delivered with care. Quality you can trust, service you deserve.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                hello@villshop.com
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                +254 700 000 000
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Nairobi, Kenya
              </p>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted">
          © {new Date().getFullYear()} Vill Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
