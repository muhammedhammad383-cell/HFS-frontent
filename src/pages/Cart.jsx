import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Clock, ShoppingBag, Minus, Plus } from "lucide-react";
import { inr } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function Cart() {
  const { cart, updateQty, removeItem, saveForLater, moveToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Empty title="Please login to view your cart" cta="Login" onClick={() => navigate("/login")} />
    );
  }
  if (!cart.items.length && !cart.saved.length) {
    return <Empty title="Your cart is empty" sub="Add products to get started" cta="Start Shopping" onClick={() => navigate("/products")} />;
  }

  const delivery = cart.subtotal >= 999 ? 0 : cart.subtotal > 0 ? 49 : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-heading text-2xl font-bold text-slate-900">Shopping Cart</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {cart.items.map((it) => (
            <div key={it.product_id} className="flex gap-4 rounded-2xl border border-border bg-card p-4" data-testid={`cart-item-${it.product_id}`}>
              <Link to={`/product/${it.product_id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
                <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <Link to={`/product/${it.product_id}`} className="line-clamp-2 font-semibold text-slate-900 hover:text-brand">{it.name}</Link>
                <p className="text-xs text-muted-foreground">Sold by {it.store_name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-bold text-slate-900">{inr(it.eff_price)}</span>
                  {it.sale_price && <span className="text-sm text-muted-foreground line-through">{inr(it.price)}</span>}
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center rounded-lg border border-border">
                    <button onClick={() => updateQty(it.product_id, it.qty - 1)} className="p-1.5" data-testid={`cart-minus-${it.product_id}`}><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-8 text-center text-sm font-semibold">{it.qty}</span>
                    <button onClick={() => updateQty(it.product_id, it.qty + 1)} className="p-1.5" data-testid={`cart-plus-${it.product_id}`}><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <button onClick={() => saveForLater(it.product_id)} className="flex items-center gap-1 text-sm text-slate-600 hover:text-brand"><Clock className="h-4 w-4" /> Save for later</button>
                  <button onClick={() => removeItem(it.product_id)} className="flex items-center gap-1 text-sm text-rose-brand hover:underline" data-testid={`cart-remove-${it.product_id}`}><Trash2 className="h-4 w-4" /> Remove</button>
                </div>
              </div>
            </div>
          ))}

          {cart.saved.length > 0 && (
            <div className="pt-4">
              <h3 className="mb-3 font-heading font-bold text-slate-900">Saved for later ({cart.saved.length})</h3>
              {cart.saved.map((it) => (
                <div key={it.product_id} className="mb-3 flex gap-4 rounded-2xl border border-border bg-card p-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary"><img src={it.image} alt="" className="h-full w-full object-cover" /></div>
                  <div className="flex flex-1 flex-col">
                    <p className="line-clamp-1 font-semibold text-slate-900">{it.name}</p>
                    <span className="font-bold text-slate-900">{inr(it.eff_price)}</span>
                    <button onClick={() => moveToCart(it.product_id)} className="mt-auto w-fit text-sm font-semibold text-brand-dark hover:underline" data-testid={`move-to-cart-${it.product_id}`}>Move to cart</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="lg:col-span-1">
            <div className="sticky top-40 rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-4 font-heading font-bold text-slate-900">Order Summary</h3>
              <Row label="Subtotal" value={inr(cart.subtotal)} />
              <Row label="Delivery" value={delivery === 0 ? "FREE" : inr(delivery)} green={delivery === 0} />
              {cart.subtotal < 999 && <p className="mt-1 text-xs text-brand-dark">Add {inr(999 - cart.subtotal)} more for FREE delivery</p>}
              <div className="my-3 border-t border-border" />
              <Row label="Total" value={inr(cart.subtotal + delivery)} bold />
              <Button onClick={() => navigate("/checkout")} data-testid="proceed-checkout-btn" className="mt-5 w-full rounded-xl bg-brand py-6 font-semibold text-white hover:bg-brand-dark">Proceed to Checkout</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, bold, green }) {
  return (
    <div className={`flex justify-between py-1 ${bold ? "font-heading text-lg font-bold text-slate-900" : "text-sm text-slate-600"}`}>
      <span>{label}</span><span className={green ? "font-semibold text-trust" : ""}>{value}</span>
    </div>
  );
}

function Empty({ title, sub, cta, onClick }) {
  return (
    <div className="mx-auto grid max-w-md place-items-center px-4 py-24 text-center">
      <ShoppingBag className="h-14 w-14 text-muted-foreground" />
      <h2 className="mt-4 font-heading text-xl font-bold text-slate-900">{title}</h2>
      {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
      <Button onClick={onClick} className="mt-5 rounded-xl bg-brand text-white hover:bg-brand-dark">{cta}</Button>
    </div>
  );
}
