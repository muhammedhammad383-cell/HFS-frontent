import React from "react";
import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { inr, discountPct } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }) {
  const { addToCart, toggleWishlist, inWishlist } = useCart();
  const pct = discountPct(product.price, product.sale_price);
  const price = product.sale_price || product.price;
  const wished = inWishlist(product.id);

  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {pct > 0 && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-rose-brand px-2.5 py-1 text-xs font-bold text-white">
          -{pct}%
        </span>
      )}
      <button
        data-testid={`wishlist-toggle-${product.id}`}
        onClick={() => toggleWishlist(product.id)}
        className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur transition-colors hover:text-rose-brand"
      >
        <Heart className={`h-4.5 w-4.5 ${wished ? "fill-rose-brand text-rose-brand" : ""}`} size={18} />
      </button>
      <Link to={`/product/${product.id}`} className="block overflow-hidden bg-secondary">
        <div className="aspect-square w-full overflow-hidden">
          <img
            src={product.images?.[0]}
            alt={product.name}
            loading="lazy"
            className="zoom-img h-full w-full object-cover"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-xs font-medium text-brand-dark">{product.store_name}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900 hover:text-brand">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1.5 flex items-center gap-1">
          <span className="flex items-center gap-0.5 rounded bg-trust px-1.5 py-0.5 text-xs font-semibold text-white">
            {product.rating?.toFixed(1)} <Star className="h-3 w-3 fill-white" />
          </span>
          <span className="text-xs text-muted-foreground">({product.review_count})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-black text-slate-900">{inr(price)}</span>
          {pct > 0 && <span className="text-sm text-muted-foreground line-through">{inr(product.price)}</span>}
        </div>
        <div className="mt-auto pt-3">
          <Button
            data-testid={`add-to-cart-${product.id}`}
            onClick={() => addToCart(product.id)}
            disabled={product.stock <= 0}
            className="w-full rounded-xl bg-brand font-semibold text-white hover:bg-brand-dark"
            size="sm"
          >
            {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-square w-full bg-secondary" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/2 rounded bg-secondary" />
        <div className="h-4 w-full rounded bg-secondary" />
        <div className="h-5 w-1/3 rounded bg-secondary" />
      </div>
    </div>
  );
}
