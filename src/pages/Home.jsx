import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Truck, ShieldCheck, RotateCcw, BadgeIndianRupee, Star } from "lucide-react";
import api from "@/lib/api";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

function Section({ title, subtitle, to, children }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {to && (
          <Link to={to} className="flex items-center gap-1 text-sm font-semibold text-brand-dark hover:underline">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Rail({ products, loading }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
      {loading
        ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
        : products.slice(0, 5).map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [cats, setCats] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newArr, setNewArr] = useState([]);
  const [best, setBest] = useState([]);
  const [stores, setStores] = useState([]);
  const [slide, setSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "HFSBAG - Storage, Covers & Bags Marketplace";
    Promise.all([
      api.get("/banners"),
      api.get("/categories"),
      api.get("/products?featured=true&limit=5"),
      api.get("/products?trending=true&limit=5"),
      api.get("/products?sort=newest&limit=5"),
      api.get("/products?sort=popularity&limit=5"),
      api.get("/stores"),
    ]).then(([b, c, f, t, n, bs, st]) => {
      setBanners(b.data);
      setCats(c.data);
      setFeatured(f.data.products);
      setTrending(t.data.products);
      setNewArr(n.data.products);
      setBest(bs.data.products);
      setStores(st.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners]);

  const trust = [
    { icon: Truck, label: "Free Delivery", sub: "On orders ₹999+" },
    { icon: ShieldCheck, label: "Secure Payments", sub: "UPI, Cards, COD" },
    { icon: RotateCcw, label: "Easy Returns", sub: "7-day policy" },
    { icon: BadgeIndianRupee, label: "Best Prices", sub: "Direct from sellers" },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-3xl bg-slate-200 sm:aspect-[21/7]" data-testid="hero-slider">
          {banners.map((b, i) => (
            <Link
              to={b.link || "/products"}
              key={b.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === slide ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center gap-3 p-6 sm:p-14">
                <span className="w-fit rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">Featured</span>
                <h1 className="max-w-xl font-heading text-2xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">{b.title}</h1>
                <p className="max-w-md text-sm text-slate-200 sm:text-base">{b.subtitle}</p>
                <Button className="w-fit rounded-full bg-white font-semibold text-slate-900 hover:bg-amber-100">Shop Now</Button>
              </div>
            </Link>
          ))}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} className={`h-2 rounded-full transition-all ${i === slide ? "w-6 bg-white" : "w-2 bg-white/50"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-4">
          {trust.map((t) => (
            <div key={t.label} className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-brand-dark"><t.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-bold text-slate-900">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <Section title="Shop by Category" subtitle="Find the perfect protection for everything you own" to="/products">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-5">
          {cats.slice(0, 10).map((c) => (
            <Link key={c.id} to={`/category/${c.slug}`} data-testid={`category-${c.slug}`} className="group flex flex-col items-center gap-2 text-center">
              <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-secondary">
                <img src={c.image} alt={c.name} loading="lazy" className="zoom-img h-full w-full object-cover" />
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-brand sm:text-sm">{c.name}</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Deals of the Day" subtitle="Biggest discounts, limited time" to="/products?sort=popularity">
        <Rail products={best} loading={loading} />
      </Section>

      <Section title="Featured Products" to="/products?featured=true"><Rail products={featured} loading={loading} /></Section>
      <Section title="Trending Now" to="/products?trending=true"><Rail products={trending} loading={loading} /></Section>
      <Section title="New Arrivals" to="/products?sort=newest"><Rail products={newArr} loading={loading} /></Section>

      {/* Sellers */}
      <Section title="Featured Stores" subtitle="Trusted sellers on HFSBAG" to="/products">
        <div className="grid gap-4 sm:grid-cols-3">
          {stores.map((s) => (
            <Link key={s.id} to={`/store/${s.id}`} data-testid={`store-${s.id}`} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-lg">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-slate-900 font-heading text-xl font-bold text-brand-light">{s.name?.[0]}</div>
              <div className="min-w-0">
                <p className="truncate font-heading font-bold text-slate-900">{s.name}</p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-brand text-brand" /> {s.rating} · {s.product_count} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Reviews */}
      <Section title="What Our Customers Say">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { n: "Priya S.", t: "The saree covers are excellent quality. My silk sarees stay dust-free and fresh!", c: "Mumbai" },
            { n: "Rahul M.", t: "Ordered a car cover, fits perfectly and survived the monsoon. Great value.", c: "Pune" },
            { n: "Anjali K.", t: "Fast delivery and the storage bags are super sturdy. Will order again.", c: "Delhi" },
          ].map((r) => (
            <div key={r.n} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex gap-0.5 text-brand">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-brand" />)}</div>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">"{r.t}"</p>
              <p className="mt-4 text-sm font-bold text-slate-900">{r.n} <span className="font-normal text-muted-foreground">· {r.c}</span></p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
