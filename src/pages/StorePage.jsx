import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Check, Store } from "lucide-react";
import api from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";

export default function StorePage() {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  useEffect(() => { api.get(`/stores/${id}`).then(({ data }) => setStore(data)); window.scrollTo(0, 0); }, [id]);
  if (!store) return <div className="grid min-h-[60vh] place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand font-heading text-2xl font-bold text-white">{store.name?.[0]}</div>
          <div>
            <h1 className="flex items-center gap-2 font-heading text-2xl font-bold">{store.name} {store.verified && <span className="flex items-center gap-1 rounded-full bg-trust px-2 py-0.5 text-xs"><Check className="h-3 w-3" /> Verified</span>}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-200"><Star className="h-4 w-4 fill-brand-light text-brand-light" /> {store.rating} · {store.products?.length || 0} products</p>
          </div>
        </div>
        {store.description && <p className="mt-4 max-w-2xl text-sm text-slate-300">{store.description}</p>}
      </div>
      <h2 className="mb-5 mt-8 font-heading text-xl font-bold text-slate-900">Products from {store.name}</h2>
      {store.products?.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {store.products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : <p className="py-12 text-center text-muted-foreground">No products yet.</p>}
    </div>
  );
}

export function LegalPage() {
  const { slug } = useParams();
  const [pages, setPages] = useState({});
  useEffect(() => { api.get("/settings/public").then(({ data }) => setPages(data.legal_pages || {})); window.scrollTo(0, 0); }, [slug]);
  const titles = {
    about: "About Us", contact: "Contact Us", privacy: "Privacy Policy", terms: "Terms & Conditions",
    shipping: "Shipping Policy", returns: "Return & Refund Policy", seller_terms: "Seller Terms", cancellation: "Cancellation Policy",
  };
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-slate-900">{titles[slug] || "Information"}</h1>
      <div className="mt-6 rounded-2xl border border-border bg-card p-8 text-slate-700 leading-relaxed whitespace-pre-line">
        {pages[slug] || "Content coming soon."}
      </div>
      <Link to="/" className="mt-6 inline-block text-sm font-semibold text-brand-dark hover:underline">← Back to home</Link>
    </div>
  );
}
