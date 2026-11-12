import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import api, { inr } from "@/lib/api";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const SORTS = [
  ["popularity", "Popularity"], ["newest", "Newest First"],
  ["price_low", "Price: Low to High"], ["price_high", "Price: High to Low"], ["rating", "Rating"],
];

function FilterPanel({ cats, stores, filters, setFilters }) {
  const upd = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 font-heading text-sm font-bold text-slate-900">Category</h4>
        <div className="max-h-52 space-y-1.5 overflow-auto pr-1">
          {cats.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <Checkbox checked={filters.category === c.slug} onCheckedChange={(v) => upd("category", v ? c.slug : "")} data-testid={`filter-cat-${c.slug}`} />
              {c.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 font-heading text-sm font-bold text-slate-900">Price Range</h4>
        <Slider min={0} max={3000} step={100} value={[filters.max_price || 3000]} onValueChange={([v]) => upd("max_price", v)} data-testid="filter-price" />
        <p className="mt-2 text-sm text-muted-foreground">Up to {inr(filters.max_price || 3000)}</p>
      </div>
      <div>
        <h4 className="mb-2 font-heading text-sm font-bold text-slate-900">Customer Rating</h4>
        {[4, 3, 2].map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <Checkbox checked={filters.min_rating === r} onCheckedChange={(v) => upd("min_rating", v ? r : 0)} data-testid={`filter-rating-${r}`} />
            {r}★ & above
          </label>
        ))}
      </div>
      <div>
        <h4 className="mb-2 font-heading text-sm font-bold text-slate-900">Discount</h4>
        {[50, 30, 10].map((d) => (
          <label key={d} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <Checkbox checked={filters.min_discount === d} onCheckedChange={(v) => upd("min_discount", v ? d : 0)} data-testid={`filter-discount-${d}`} />
            {d}% or more
          </label>
        ))}
      </div>
      <div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
          <Checkbox checked={!!filters.in_stock} onCheckedChange={(v) => upd("in_stock", v)} data-testid="filter-instock" />
          In Stock Only
        </label>
      </div>
      
    </div>
  );
}

export default function Products() {
  const [sp, setSp] = useSearchParams();
  const { slug } = useParams();
  const [cats, setCats] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(sp.get("sort") || "popularity");
  const [filters, setFilters] = useState({
    category: slug || sp.get("category") || "",
    search: sp.get("search") || "",
    featured: sp.get("featured") || "",
    trending: sp.get("trending") || "",
    max_price: 0, min_rating: 0, min_discount: 0, in_stock: false, seller: "",
  });

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCats(data));
    api.get("/stores").then(({ data }) => setStores(data));
  }, []);

  useEffect(() => {
    setFilters((f) => ({ ...f, category: slug || sp.get("category") || "", search: sp.get("search") || "" }));
  }, [slug, sp]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("sort", sort);
    params.set("page", page);
    params.set("limit", "20");
    if (filters.category) params.set("category", filters.category);
    if (filters.search) params.set("search", filters.search);
    if (filters.featured) params.set("featured", "true");
    if (filters.trending) params.set("trending", "true");
    if (filters.max_price && filters.max_price < 3000) params.set("max_price", filters.max_price);
    if (filters.min_rating) params.set("min_rating", filters.min_rating);
    if (filters.min_discount) params.set("min_discount", filters.min_discount);
    if (filters.in_stock) params.set("in_stock", "true");
    if (filters.seller) params.set("seller", filters.seller);
    const { data } = await api.get(`/products?${params.toString()}`);
    let resultProducts = data.products || [];
    let resultTotal = data.total || 0;

    if (filters.category) {
      const normCat = (str) =>
        String(str || "")
          .toLowerCase()
          .trim()
          .replace(/&/g, "and")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .replace(/shoes/g, "shoe")
          .replace(/clothes/g, "cloth")
          .replace(/covers/g, "cover")
          .replace(/bags/g, "bag")
          .replace(/pouches/g, "pouch");

      const matchedCatObj = cats.find(
        (c) =>
          normCat(c.slug) === normCat(filters.category) ||
          normCat(c.name) === normCat(filters.category) ||
          String(c.id) === String(filters.category)
      );
      const targetNorm = normCat(matchedCatObj?.name || filters.category);
      const targetSlugNorm = normCat(matchedCatObj?.slug || filters.category);

      const allParams = new URLSearchParams(params);
      allParams.delete("category");
      allParams.set("limit", "200");
      allParams.set("page", "1");
      const { data: allData } = await api.get(`/products?${allParams.toString()}`);
      const allList = allData?.products || [];

      const matchedList = allList.filter((p) => {
        const pCatNorm = normCat(p.category || p.category_name || "");
        const pSlugNorm = normCat(p.category_slug || "");
        if (
          pCatNorm === targetNorm ||
          pCatNorm === targetSlugNorm ||
          (pSlugNorm && (pSlugNorm === targetNorm || pSlugNorm === targetSlugNorm)) ||
          (matchedCatObj?.id && String(p.category_id) === String(matchedCatObj.id))
        ) {
          return true;
        }
        return false;
      });

      if (matchedList.length > resultProducts.length) {
        resultProducts = matchedList;
        resultTotal = matchedList.length;
      }
    }

    setProducts(resultProducts);
    setTotal(resultTotal);
    setLoading(false);
  }, [sort, page, filters, cats]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [filters, sort]);

  const heading = filters.search ? `Results for "${filters.search}"`
    : filters.category ? cats.find((c) => (c.slug || "").toLowerCase() === filters.category.toLowerCase() || (c.name || "").toLowerCase() === filters.category.toLowerCase())?.name || filters.category.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
    : filters.featured ? "Featured Products" : filters.trending ? "Trending Now" : "All Products";

  const pages = Math.ceil(total / 20);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">{heading}</h1>
          <p className="text-sm text-muted-foreground">{total} products found</p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 lg:hidden" data-testid="mobile-filter-btn">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-auto">
              <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
              <div className="mt-4"><FilterPanel cats={cats} stores={stores} filters={filters} setFilters={setFilters} /></div>
            </SheetContent>
          </Sheet>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44" data-testid="sort-select"><SelectValue /></SelectTrigger>
            <SelectContent>{SORTS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-40 rounded-2xl border border-border bg-card p-5">
            <FilterPanel cats={cats} stores={stores} filters={filters} setFilters={setFilters} />
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border py-24 text-center">
              <X className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-heading text-lg font-bold text-slate-900">No products found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4" data-testid="product-grid">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {Array.from({ length: pages }).map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)} data-testid={`page-${i + 1}`}
                      className={`h-9 w-9 rounded-lg text-sm font-semibold ${page === i + 1 ? "bg-brand text-white" : "border border-border bg-white text-slate-700"}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
