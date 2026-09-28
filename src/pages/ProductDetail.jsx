import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Heart, Star, Truck, ShieldCheck, RotateCcw, Minus, Plus, Store, Check } from "lucide-react";
import api, { inr, discountPct } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, inWishlist } = useCart();
  const { user } = useAuth();
  const [p, setP] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pinResult, setPinResult] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const load = () => api.get(`/products/${id}`).then(({ data }) => {
    setP(data); setActiveImg(0);
    document.title = `${data.name} | HFSBAG`;
  });

  useEffect(() => { load(); window.scrollTo(0, 0); }, [id]);

  if (!p) return <div className="grid min-h-[60vh] place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" /></div>;

  const price = p.sale_price || p.price;
  const pct = discountPct(p.price, p.sale_price);
  const wished = inWishlist(p.id);

  const checkPin = async () => {
    try { const { data } = await api.get(`/pincode/${pincode}`); setPinResult(data); }
    catch (e) { toast.error("Enter a valid 6-digit pincode"); }
  };

  const buyNow = async () => {
    const ok = await addToCart(p.id, qty);
    if (ok) navigate("/checkout");
  };

  const submitReview = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      await api.post("/reviews", { product_id: p.id, rating, comment });
      toast.success("Review submitted");
      setComment(""); load();
    } catch (e) { toast.error("Could not submit review"); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-brand">Home</Link> / <Link to={`/category/${p.category_name?.toLowerCase().replace(/ /g, "-")}`} className="hover:text-brand">{p.category_name}</Link> / <span className="text-slate-700">{p.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex gap-2 sm:flex-col">
            {(p.images || []).map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} data-testid={`thumb-${i}`}
                className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${activeImg === i ? "border-brand" : "border-border"}`}>
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="group flex-1 overflow-hidden rounded-2xl border border-border bg-white">
            <div className="aspect-square w-full overflow-hidden">
              <img src={p.images?.[activeImg]} alt={p.name} className="zoom-img h-full w-full object-cover" data-testid="main-product-image" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div>
          <Link to={`/store/${p.store_id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-dark hover:underline">
            <Store className="h-4 w-4" /> {p.store_name} {p.store?.verified && <Check className="h-3.5 w-3.5 text-trust" />}
          </Link>
          <h1 className="mt-1.5 font-heading text-2xl font-bold text-slate-900 sm:text-3xl">{p.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex items-center gap-0.5 rounded bg-trust px-2 py-0.5 text-sm font-semibold text-white">{p.rating?.toFixed(1)} <Star className="h-3.5 w-3.5 fill-white" /></span>
            <span className="text-sm text-muted-foreground">{p.review_count} ratings · {p.sold_count} sold</span>
          </div>

          <div className="mt-4 flex items-end gap-3">
            <span className="font-heading text-3xl font-black text-slate-900">{inr(price)}</span>
            {pct > 0 && <><span className="text-lg text-muted-foreground line-through">{inr(p.price)}</span><span className="pb-1 text-lg font-bold text-trust">{pct}% off</span></>}
          </div>
          <p className="mt-1 text-sm font-medium text-trust">{p.stock > 0 ? `In stock (${p.stock} available)` : "Out of stock"}</p>

          {/* qty + actions */}
          <div className="mt-5 flex items-center gap-4">
            <div className="flex items-center rounded-xl border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5" data-testid="qty-minus"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center font-semibold" data-testid="qty-value">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(p.stock, q + 1))} className="p-2.5" data-testid="qty-plus"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => addToCart(p.id, qty)} disabled={p.stock <= 0} data-testid="pdp-add-to-cart" className="flex-1 rounded-xl bg-slate-900 font-semibold text-white hover:bg-slate-800 sm:flex-none sm:px-8">Add to Cart</Button>
            <Button onClick={buyNow} disabled={p.stock <= 0} data-testid="pdp-buy-now" className="flex-1 rounded-xl bg-brand font-semibold text-white hover:bg-brand-dark sm:flex-none sm:px-8">Buy Now</Button>
            <Button onClick={() => toggleWishlist(p.id)} variant="outline" size="icon" data-testid="pdp-wishlist" className="rounded-xl">
              <Heart className={`h-5 w-5 ${wished ? "fill-rose-brand text-rose-brand" : ""}`} />
            </Button>
          </div>

          {/* Pincode */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900"><Truck className="h-4 w-4 text-brand" /> Delivery & Services</p>
            <div className="flex gap-2">
              <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Enter 6-digit pincode" maxLength={6}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand" data-testid="pincode-input" />
              <Button onClick={checkPin} variant="outline" size="sm" data-testid="pincode-check-submit">Check</Button>
            </div>
            {pinResult && (
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-slate-700"><Check className="mr-1 inline h-4 w-4 text-trust" /> Delivery by <b>{pinResult.estimated_delivery}</b></p>
                <p className="text-slate-700">{pinResult.cod_available ? "Cash on Delivery available" : "Prepaid only for this pincode"}</p>
              </div>
            )}
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-xs text-muted-foreground">
              <div><ShieldCheck className="mx-auto mb-1 h-4 w-4 text-brand" /> Secure Payment</div>
              <div><RotateCcw className="mx-auto mb-1 h-4 w-4 text-brand" /> 7-Day Returns</div>
              <div><Truck className="mx-auto mb-1 h-4 w-4 text-brand" /> Fast Delivery</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <Tabs defaultValue="desc">
          <TabsList className="w-full justify-start rounded-xl bg-secondary sm:w-auto">
            <TabsTrigger value="desc" data-testid="tab-desc">Description</TabsTrigger>
            <TabsTrigger value="specs" data-testid="tab-specs">Specifications</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews ({p.review_count})</TabsTrigger>
          </TabsList>
          <TabsContent value="desc" className="mt-4 rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed text-slate-700">{p.description}</TabsContent>
          <TabsContent value="specs" className="mt-4 rounded-2xl border border-border bg-card p-6">
            <table className="w-full text-sm">
              <tbody>
                {(p.specifications || []).map((s, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-muted-foreground">{s.key}</td>
                    <td className="py-2.5 text-slate-800">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>
          <TabsContent value="reviews" className="mt-4 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h4 className="mb-3 font-heading font-bold text-slate-900">Write a Review</h4>
              <div className="mb-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} onClick={() => setRating(r)} data-testid={`review-star-${r}`}>
                    <Star className={`h-6 w-6 ${r <= rating ? "fill-brand text-brand" : "text-slate-300"}`} />
                  </button>
                ))}
              </div>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." data-testid="review-comment" />
              <Button onClick={submitReview} className="mt-3 rounded-xl bg-brand text-white hover:bg-brand-dark" data-testid="submit-review-btn">Submit Review</Button>
            </div>
            {(p.reviews || []).length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No reviews yet. Be the first!</p>}
            {(p.reviews || []).map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 rounded bg-trust px-2 py-0.5 text-xs font-semibold text-white">{r.rating} <Star className="h-3 w-3 fill-white" /></span>
                  <span className="font-semibold text-slate-900">{r.user_name}</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{r.comment}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Related */}
      {p.related?.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-5 font-heading text-2xl font-bold text-slate-900">Related Products</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
            {p.related.slice(0, 5).map((rp) => <ProductCard key={rp.id} product={rp} />)}
          </div>
        </div>
      )}
    </div>
  );
}
