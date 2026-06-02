import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { CartDrawer } from '../../components/cart/CartDrawer';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
