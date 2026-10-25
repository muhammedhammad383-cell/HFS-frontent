import React from "react";
import { Link } from "react-router-dom";
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export function Footer() {
  const cols = [
    {
      title: "Shop",
      links: [
        ["All Products", "/products"],
        ["Saree Covers", "/category/saree-covers"],
        ["Storage Bags", "/category/storage-bags"],
        ["Vehicle Covers", "/category/vehicle-covers"]
      ]
    },
    {
      title: "Company",
      links: [
        ["About Us", "/page/about"],
        ["Contact Us", "/page/contact"]
      ]
    },
    {
      title: "Legal & Policies",
      links: [
        ["Privacy Policy", "/page/privacy"],
        ["Terms & Conditions", "/page/terms"],
        ["Shipping & Delivery Policy", "/page/shipping"],
        ["Cancellation & Refund Policy", "/cancellation-refund"]
      ]
    }
  ];

  return (
    <footer className="mt-16 border-t border-border bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="font-heading text-2xl font-extrabold text-white">
            <span className="text-brand-light">HFS BAZAAR</span>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
              STORE &amp; LIVING
            </p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            India&apos;s trusted direct-to-consumer store for premium saree covers, wardrobe organizers, and protective storage solutions.
          </p>
          <div className="mt-4 space-y-1 text-xs leading-relaxed text-slate-400">
            <p><strong className="text-slate-200">Legal Entity:</strong> HFS</p>
            <p><strong className="text-slate-200">Proprietor:</strong> Mr. Mohammed Hammad Ejazul Haque Ansari</p>
            <p><strong className="text-slate-200">Address:</strong> 25/M/95/, Behind F Block, 666, Municipal Transit Camp, Bapurao Jagtap Marg, Byculla (W), Mumbai - 400011</p>
            <p><strong className="text-slate-200">Email:</strong> support@hfsbazaar.in | hfsplastic@gmail.com</p>
          </div>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-white">{col.title}</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-slate-400 transition-colors hover:text-brand-light">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} HFS (Operating as HFS BAZAAR) • Prop. Mohammed Hammad Ejazul Haque Ansari. All rights reserved.
      </div>
    </footer>
  );
}

export function MobileNav() {
  const { user } = useAuth();
  const { cartCount, wishlist } = useCart();
  if (user && user.role !== "customer") return null;
  const item = "flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium text-slate-600";
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-white/95 py-2 backdrop-blur-md md:hidden">
      <Link to="/" className={item} data-testid="mnav-home"><Home className="h-5 w-5" /> Home</Link>
      <Link to="/products" className={item} data-testid="mnav-shop"><Search className="h-5 w-5" /> Shop</Link>
      <Link to="/cart" className={`${item} relative`} data-testid="mnav-cart">
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && <span className="absolute right-1 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">{cartCount}</span>}
        Cart
      </Link>
      <Link to={user ? "/account/wishlist" : "/login"} className={`${item} relative`} data-testid="mnav-wishlist">
        <Heart className="h-5 w-5" />
        {wishlist.length > 0 && <span className="absolute right-1 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-rose-brand px-1 text-[9px] font-bold text-white">{wishlist.length}</span>}
        Wishlist
      </Link>
      <Link to={user ? "/account" : "/login"} className={item} data-testid="mnav-account"><User className="h-5 w-5" /> Account</Link>
    </nav>
  );
}

export function StoreLayout({ children }) {
  return null;
}
