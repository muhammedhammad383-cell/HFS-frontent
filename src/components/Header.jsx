import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, User, Menu, Store, LogOut, Package, LayoutDashboard, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function Header() {
  const { user, logout } = useAuth();
  const { cartCount, wishlist } = useCart();
  const [q, setQ] = useState("");
  const [cats, setCats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCats(data)).catch(() => {});
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(q)}`);
  };

  const dashboardLink = user?.role === "admin" ? "/admin" : user?.role === "seller" ? "/seller" : "/account";

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="bg-slate-900 py-1.5 text-center text-xs font-medium text-amber-100">
        Free delivery on orders above ₹999 • Easy 7-day returns • COD available
      </div>
      <div className="border-b border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button data-testid="mobile-menu-btn" className="md:hidden">
                <Menu className="h-6 w-6 text-slate-700" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left font-heading text-xl font-extrabold">
                  <span className="text-brand">HFS</span>BAG
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1">
                <Link to="/products" className="rounded-lg px-3 py-2 font-medium hover:bg-secondary">All Products</Link>
                {cats.map((c) => (
                  <Link key={c.id} to={`/category/${c.slug}`} className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-secondary">
                    {c.name}
                  </Link>
                ))}
                <Link to="/seller/register" className="mt-2 rounded-lg bg-accent px-3 py-2 font-medium text-brand-dark">Become a Seller</Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" data-testid="logo-link" className="font-heading text-2xl font-extrabold tracking-tight text-slate-900"><div className="flex items-center gap-2"><img src="/logo.svg" alt="HFS" className="h-9 w-auto object-contain rounded-full" /><span className="font-extrabold text-xl tracking-tight text-gray-900">HFS</span></div></Link>

          <form onSubmit={submitSearch} className="relative ml-2 hidden flex-1 md:block">
            <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              data-testid="homepage-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for saree covers, storage bags, car covers..."
              className="w-full rounded-full border border-border bg-secondary/60 py-2.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-brand focus:bg-white"
            />
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link to="/seller/register" data-testid="seller-register-link" className="hidden lg:block">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-full border-brand/40 text-brand-dark hover:bg-accent">
                <Store className="h-4 w-4" /> Sell on HFS
              </Button>
            </Link>

            {user && user.role === "customer" && (
              <Link to="/account/wishlist" data-testid="wishlist-link" className="relative hidden p-2 sm:block">
                <Heart className="h-5.5 w-5.5 text-slate-700" size={22} />
                {wishlist.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-rose-brand px-1 text-[10px] font-bold text-white">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            )}

            {(!user || user.role === "customer") && (
              <Link to="/cart" data-testid="cart-link" className="relative p-2">
                <ShoppingCart className="h-5.5 w-5.5 text-slate-700" size={22} />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button data-testid="user-menu-btn" className="flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1.5">
                    <User className="h-4.5 w-4.5 text-slate-700" size={18} />
                    <span className="hidden max-w-24 truncate text-sm font-medium sm:inline">{user.name?.split(" ")[0]}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(dashboardLink)} data-testid="menu-dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> {user.role === "customer" ? "My Account" : "Dashboard"}
                  </DropdownMenuItem>
                  {user.role === "customer" && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/account/orders")}>
                        <Package className="mr-2 h-4 w-4" /> My Orders
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/account/notifications")}>
                        <Bell className="mr-2 h-4 w-4" /> Notifications
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); navigate("/"); }} data-testid="logout-btn">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" data-testid="login-link">
                <Button size="sm" className="rounded-full bg-slate-900 font-semibold text-white hover:bg-slate-800">Login</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={submitSearch} className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              data-testid="homepage-search-input-mobile"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-border bg-secondary/60 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-brand focus:bg-white"
            />
          </div>
        </form>

        {/* Category ribbon */}
        <nav className="hidden border-t border-border md:block">
          <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-6 py-2.5 text-sm no-scrollbar lg:px-8">
            <Link to="/products" className="whitespace-nowrap font-semibold text-slate-900 hover:text-brand">All</Link>
            {cats.map((c) => (
              <Link key={c.id} to={`/category/${c.slug}`} className="whitespace-nowrap text-slate-600 transition-colors hover:text-brand">
                {c.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
