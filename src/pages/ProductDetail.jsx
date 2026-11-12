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
  const [selectedColor, setSelectedColor] = useState("Beige");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedPack, setSelectedPack] = useState("");
  const [unit, setUnit] = useState("in");
  const [pincode, setPincode] = useState("");
  const [pinResult, setPinResult] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const load = () => api.get(`/products/${id}`).then(({ data }) => {
    setP(data); setActiveImg(0);
    const specColor = (data.specifications || []).find(s => /^(color|colour)$/i.test((s.key || "").trim()))?.value;
    let initCol = "Beige";
    if (Array.isArray(data.colors) && data.colors.length) {
      initCol = data.colors[0];
    } else if (specColor) {
      initCol = specColor.trim();
    } else {
      const m = (data.name || "").match(/\b(Beige|Maroon|Pink|Golden|Gold|Slate Blue|Steel Grey|Grey|Blue|Coffee|Brown|Red|Navy|Cream|Black|White|Purple|Green)\b/i);
      if (m) initCol = m[1];
    }
    setSelectedColor(initCol);
    document.title = `${data.name} | HFS`;
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
        {/* Gallery (Color-Aware Multi-Photo Gallery) */}
        {(() => {
          const allImgs = Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []);
          let colorImgMap = {};
          const rawCi = Array.isArray(p.specifications)
            ? (p.specifications.find(s => (s.key || "").toLowerCase() === "color_images")?.value)
            : (p.specifications?.color_images);
          if (rawCi) {
            try { colorImgMap = typeof rawCi === "string" ? JSON.parse(rawCi) : rawCi; } catch (e) {}
          }
          if (p.colorImages && typeof p.colorImages === "object") {
            colorImgMap = { ...colorImgMap, ...p.colorImages };
          }
          const matchedColorKey = Object.keys(colorImgMap).find(k => k.toLowerCase() === (selectedColor || "").toLowerCase());
          const rawList = matchedColorKey && Array.isArray(colorImgMap[matchedColorKey]) && colorImgMap[matchedColorKey].length > 0
            ? colorImgMap[matchedColorKey]
            : null;
          const colorSpecificList = rawList
            ? rawList.map(item => (typeof item === "number" ? allImgs[item] : item)).filter(Boolean)
            : null;
          const activeGallery = (colorSpecificList && colorSpecificList.length > 0) ? colorSpecificList : allImgs;
          const safeIdx = activeImg < activeGallery.length ? activeImg : 0;
          return (
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <div className="flex gap-2 overflow-x-auto sm:flex-col">
                {activeGallery.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} data-testid={`thumb-${i}`}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${safeIdx === i ? "border-brand" : "border-border"}`}>
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="group flex-1 overflow-hidden rounded-2xl border border-border bg-white">
                <div className="aspect-square w-full overflow-hidden">
                  <img src={activeGallery[safeIdx]} alt={p.name} className="zoom-img h-full w-full object-cover" data-testid="main-product-image" />
                </div>
              </div>
            </div>
          );
        })()}

        {/* Info */}
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-dark">HFS BAZAAR Official</div>
          <h1 className="mt-1.5 font-heading text-2xl font-bold text-slate-900 sm:text-3xl">{p.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex items-center gap-0.5 rounded bg-trust px-2 py-0.5 text-sm font-semibold text-white">{p.rating?.toFixed(1)} <Star className="h-3.5 w-3.5 fill-white" /></span>
            <span className="text-sm text-muted-foreground">{p.review_count} ratings · {p.sold_count} sold</span>
          </div>

          <div className="mt-4 flex items-end gap-3">
            {(() => {
              let pkMap = {};
              const rawPp = Array.isArray(p.specifications)
                ? (p.specifications.find(s => (s.key || "").toLowerCase() === "pack_prices")?.value)
                : (p.specifications?.pack_prices);
              if (rawPp) {
                try { pkMap = typeof rawPp === "string" ? JSON.parse(rawPp) : rawPp; } catch (e) {}
              }
              const spPacks = Array.isArray(p.specifications)
                ? (p.specifications.find(s => /^(pack|packs|pack size|set|set of)$/i.test((s.key || "").trim()))?.value)
                : (p.specifications?.Packs || p.specifications?.packs || "");
              const pkList = spPacks ? spPacks.split(",").map(x => x.trim()).filter(Boolean) : [];
              const curPack = pkList.includes(selectedPack) ? selectedPack : (pkList[0] || "");
              const matchKey = Object.keys(pkMap).find(k => k.toLowerCase() === curPack.toLowerCase());
              const pkData = matchKey ? pkMap[matchKey] : null;
            let szMapTop = {};
            const rawSzTop = Array.isArray(p.specifications)
              ? (p.specifications.find(s => (s.key || "").toLowerCase() === "size_config")?.value)
              : (p.specifications?.size_config);
            if (rawSzTop) { try { szMapTop = typeof rawSzTop === "string" ? JSON.parse(rawSzTop) : rawSzTop; } catch (e) {} }
            const spSizesTop = Array.isArray(p.specifications)
              ? (p.specifications.find(s => /^(size|sizes|available sizes)$/i.test((s.key || "").trim()))?.value)
              : "";
            const szListTop = spSizesTop ? spSizesTop.split(",").map(x => x.trim()).filter(Boolean) : [];
            const curSizeTop = szListTop.includes(selectedSize) ? selectedSize : (szListTop[0] || "");
            const szKeyTop = Object.keys(szMapTop).find(k => k.toLowerCase() === curSizeTop.toLowerCase());
            const szDataTop = szKeyTop ? szMapTop[szKeyTop] : null;
            const dynSale = (szDataTop && szDataTop.sale_price) ? Number(szDataTop.sale_price) : (pkData && pkData.sale_price ? Number(pkData.sale_price) : price);
            const dynMrp = (szDataTop && szDataTop.price) ? Number(szDataTop.price) : (pkData && pkData.price ? Number(pkData.price) : Number(p.price || dynSale));
              const dynPct = dynMrp > dynSale ? Math.round(((dynMrp - dynSale) / dynMrp) * 100) : pct;
              return (
                <>
                  <span className="font-heading text-3xl font-black text-slate-900">{inr(dynSale)}</span>
                  {dynPct > 0 && <><span className="text-lg text-muted-foreground line-through">{inr(dynMrp)}</span><span className="pb-1 text-lg font-bold text-trust">{dynPct}% off</span></>}
                </>
              );
            })()}
          </div>
          <p className="mt-1 text-sm font-medium text-trust">{p.stock > 0 ? `In stock (${p.stock} available)` : "Out of stock"}</p>

          
          {/* Colour Selector + Dimensions & Visual Size Guide */}
          {(() => {
            const colorMap = {
              "Beige": "#D8C3A5",
              "Maroon": "#7B1E26",
              "Pink": "#E88D96",
              "Golden": "#D4AF37",
              "Gold": "#D4AF37",
              "Slate Blue": "#5B7C99",
              "Steel Grey": "#71797E",
              "Slate Blue / Steel Grey": "#64748B",
              "Grey": "#64748B",
              "Blue": "#3B82F6",
              "Coffee": "#5C4033",
              "Brown": "#6F4E37",
              "Navy": "#1E293B",
              "Red": "#DC2626",
              "Cream": "#F5F5DC",
              "Black": "#1E293B",
              "White": "#F8FAFC",
              "Green": "#15803D",
              "Purple": "#7E22CE",
              "Yellow": "#EAB308",
              "Orange": "#F97316",
              "Teal": "#0D9488",
              "Rose Gold": "#B76E79",
              "Olive": "#65A30D",
              "Silver": "#C0C0C0",
              "Lavender": "#A855F7",
              "Peach": "#FDBA74",
              "Wine": "#722F37",
              "Mustard": "#CA8A04"
            };

            const specs = Array.isArray(p.specifications) ? p.specifications : [];
            const getSpec = (regex) => specs.find(s => regex.test((s.key || "").trim()))?.value;

            const specColor = getSpec(/^(color|colour|colors|colours)$/i);
            const specDim = getSpec(/^(dimension|dimensions|size)$/i);
            const specMat = getSpec(/^(material|fabric|gsm)$/i);

            // 1. Determine In-Stock Colours for this specific product
            let inStockColors = [];
            if (Array.isArray(p.colors) && p.colors.length > 0) {
              inStockColors = p.colors.map(c => c.trim()).filter(Boolean);
            } else if (specColor) {
              inStockColors = [specColor.trim()];
            } else {
              const titleLower = (p.name || "").toLowerCase();
              const matched = Object.keys(colorMap).filter(c => titleLower.includes(c.toLowerCase()));
              inStockColors = matched.length > 0 ? [matched[0]] : ["Beige"];
            }

            const displayColors = Array.from(new Set(inStockColors));
            const activeColor = inStockColors.includes(selectedColor) ? selectedColor : inStockColors[0];

            // 2. Determine Exact Dimensions from Specifications, Product field, or Product Title
            const titleDimMatch = (p.name || "").match(/(\d+\s*[xX*]\s*\d+(?:\s*[xX*]\s*\d+)?\s*(?:Inch|Inches|in|cm)?)/i);
            const rawDim = specDim || p.dimensions || (titleDimMatch ? titleDimMatch[1] : "16 x 14 x 3 Inches");

            const nums = (rawDim.match(/\d+(?:\.\d+)?/g) || ["16", "14", "3"]).map(Number);
            const lenIn = nums[0] || 16;
            const widIn = nums[1] || 14;
            const depIn = nums[2] || 3;

            const isCm = unit === "cm";
            const fmtVal = (v) => isCm ? `${Math.round(v * 2.54)} cm` : `${v} in`;
            const fmtShort = (v) => isCm ? `${Math.round(v * 2.54)}cm` : `${v}"`;

            const displayHeadline = isCm
              ? `${Math.round(lenIn * 2.54)} x ${Math.round(widIn * 2.54)} x ${Math.round(depIn * 2.54)} cm (${lenIn} x ${widIn} x ${depIn} Inches)`
              : `${lenIn} x ${widIn} x ${depIn} Inches (${Math.round(lenIn * 2.54)} x ${Math.round(widIn * 2.54)} x ${Math.round(depIn * 2.54)} cm)`;

            const materialLabel = specMat || ((p.name || "").includes("120 GSM") ? "120 GSM" : "Premium");

            const getColorHex = (colName) => {
              if (colorMap[colName]) return colorMap[colName];
              const foundKey = Object.keys(colorMap).find(k => colName.toLowerCase().includes(k.toLowerCase()));
              return foundKey ? colorMap[foundKey] : "#64748B";
            };

            return (
              <div className="mt-5 space-y-4 rounded-2xl border border-border bg-slate-50/70 p-4">
                {/* Colour Buttons */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Colour: <span className="text-brand-dark">{activeColor}</span>
                    </span>
                    <span className="text-[11px] font-medium text-emerald-700">
                      {inStockColors.length} Available
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {displayColors.map((col, idx) => {
                      const hex = getColorHex(col);
                      const isAvailable = p.stock > 0 && inStockColors.some(c => c.toLowerCase() === col.toLowerCase());
                      const isSel = activeColor.toLowerCase() === col.toLowerCase();
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => {
                            if (!isAvailable) {
                              toast.error(`${col} colour is currently Not Available`);
                              return;
                            }
                            setSelectedColor(col);
                            if (p.images && p.images[idx]) setActiveImg(idx);
                          }}
                          className={`relative flex items-center gap-2 rounded-xl border px-3 py-1.5 text-left transition-all ${
                            !isAvailable
                              ? "cursor-not-allowed border-slate-200 bg-slate-100/70 opacity-60"
                              : isSel
                              ? "border-brand bg-amber-50/90 text-slate-900 shadow-sm ring-1 ring-brand"
                              : "border-border bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span
                            className="relative h-4 w-4 shrink-0 rounded-full border border-black/15 shadow-inner"
                            style={{ backgroundColor: hex }}
                          >
                            {!isAvailable && (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
                                ✕
                              </span>
                            )}
                          </span>
                          <div className="flex flex-col leading-tight">
                            <span className={`text-xs font-semibold ${!isAvailable ? "line-through text-slate-400" : ""}`}>
                              {col}
                            </span>
                            <span className={`text-[9px] font-medium ${isAvailable ? "text-emerald-600" : "text-rose-500"}`}>
                              {isAvailable ? "In Stock" : "Not Available"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pack Options Selector (Pack of 2, 6, 12, etc.) */}
              {(() => {
                const specPacks = getSpec(/^(pack|packs|pack size|set|set of)$/i);
                let packList = [];
                if (Array.isArray(p.packs) && p.packs.length > 0) {
                  packList = p.packs.map(x => x.trim()).filter(Boolean);
                } else if (typeof p.packs === "string" && p.packs.trim()) {
                  packList = p.packs.split(",").map(x => x.trim()).filter(Boolean);
                } else if (specPacks) {
                  packList = specPacks.split(",").map(x => x.trim()).filter(Boolean);
                } else {
                  const titlePack = (p.name || "").match(/\b(Pack of \d+|Set of \d+|\d+\s*Pcs)\b/i);
                  if (titlePack) packList = [titlePack[1]];
                }
                if (!packList.length) return null;
                const activePack = packList.includes(selectedPack) ? selectedPack : packList[0];
                return (
                  <div className="border-t border-border pt-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        📦 Pack Size: <span className="text-brand-dark">{activePack}</span>
                      </span>
                      <span className="text-[11px] font-medium text-emerald-700">
                        {packList.length} {packList.length === 1 ? "Option" : "Options"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {packList.map((pk) => {
                        const isPkSel = activePack.toLowerCase() === pk.toLowerCase();
                        return (
                          <button
                            key={pk}
                            type="button"
                            onClick={() => setSelectedPack(pk)}
                            className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all ${
                              isPkSel
                                ? "border-brand bg-amber-50/90 text-slate-900 shadow-sm ring-1 ring-brand"
                                : "border-border bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {(() => {
                              let pkMap = {};
                              const rawPp = Array.isArray(p.specifications)
                                ? (p.specifications.find(s => (s.key || "").toLowerCase() === "pack_prices")?.value)
                                : (p.specifications?.pack_prices);
                              if (rawPp) {
                                try { pkMap = typeof rawPp === "string" ? JSON.parse(rawPp) : rawPp; } catch (e) {}
                              }
                              const mk = Object.keys(pkMap).find(k => k.toLowerCase() === pk.toLowerCase());
                              const pSale = mk && pkMap[mk]?.sale_price ? Number(pkMap[mk].sale_price) : null;
                              return (
                                <div className="flex flex-col items-center leading-tight">
                                  <span>{isPkSel ? "✓ " : ""}{pk}</span>
                                  {pSale && <span className="mt-0.5 text-[10px] font-extrabold text-amber-800">{inr(pSale)}</span>}
                                </div>
                              );
                            })()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Size Selector (Small / Medium / Large / XL) */}
              {sizeList.length > 0 && (
                <div className="border-t border-border pt-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      📏 Size: <span className="text-brand-dark">{activeSize}</span>
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {sizeList.length} {sizeList.length === 1 ? "Size" : "Sizes"}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sizeList.map((sz) => {
                      const isSel = activeSize.toLowerCase() === sz.toLowerCase();
                      const sCfg = szMap[sz] || {};
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`flex flex-col items-center rounded-xl border px-3.5 py-1.5 text-xs transition-all ${
                            isSel
                              ? "border-brand bg-amber-50/90 font-bold text-slate-900 shadow-sm ring-1 ring-brand"
                              : "border-border bg-white font-medium text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span>{isSel ? `✓ ${sz}` : sz}</span>
                          {sCfg.dimensions && (
                            <span className="text-[10px] font-normal text-slate-500">{sCfg.dimensions}</span>
                          )}
                          {sCfg.sale_price && (
                            <span className="text-[10px] font-bold text-brand-dark">₹{sCfg.sale_price}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Product Dimensions & Sample Size Guide */}
                <div className="border-t border-border pt-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      📏 Product Size & Dimensions
                    </span>
                    <div className="inline-flex rounded-lg border border-border bg-white p-0.5 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setUnit("in")}
                        className={`rounded-md px-2 py-0.5 ${unit === "in" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                      >
                        Inches
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnit("cm")}
                        className={`rounded-md px-2 py-0.5 ${unit === "cm" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                      >
                        CM
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Visual Size Diagram Card */}
                  <div className="mt-2.5 flex items-center gap-3.5 rounded-xl border border-amber-200/80 bg-white p-3 shadow-sm">
                    <div className="relative flex h-20 w-24 shrink-0 items-center justify-center rounded-lg bg-amber-50/60 p-1">
                      <svg viewBox="0 0 120 95" className="h-full w-full">
                        <rect x="22" y="16" width="76" height="56" rx="5" fill={getColorHex(activeColor)} fillOpacity="0.35" stroke="#475569" strokeWidth="2" />
                        <rect x="30" y="34" width="60" height="30" rx="3" fill="#FFFDF9" fillOpacity="0.8" stroke="#64748B" strokeWidth="1.2" strokeDasharray="2 2" />
                        <line x1="22" y1="9" x2="98" y2="9" stroke="#0F172A" strokeWidth="1.5" />
                        <text x="60" y="7" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0F172A">
                          {fmtShort(lenIn)} (Length)
                        </text>
                        <line x1="14" y1="16" x2="14" y2="72" stroke="#0F172A" strokeWidth="1.5" />
                        <text x="11" y="46" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0F172A" transform="rotate(-90 11 46)">
                          {fmtShort(widIn)} (Width)
                        </text>
                        {depIn && (<text x="60" y="85" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#B45309">Height / Depth: {fmtShort(depIn)}</text>)}
                      </svg>
                    </div>

                    <div className="flex-1 space-y-1 text-xs">
                      <p className="font-semibold text-slate-900">{displayHeadline}</p>
                      <div className={`grid ${depIn ? "grid-cols-3" : "grid-cols-2"} gap-1.5 pt-1 text-center`}>
<div className="rounded-lg bg-slate-100 px-1.5 py-1">
                          <span className="block text-[10px] text-slate-500">Length</span>
                          <span className="font-bold text-slate-800">{fmtVal(lenIn)}</span>
                        </div>
                        <div className="rounded-lg bg-slate-100 px-1.5 py-1">
                          <span className="block text-[10px] text-slate-500">Width</span>
                          <span className="font-bold text-slate-800">{fmtVal(widIn)}</span>
                        </div>
{depIn && (<div className="rounded-lg bg-slate-100 px-1.5 py-1"><span className="block text-[10px] text-slate-500">Height</span><span className="font-bold text-emerald-700">{fmtVal(depIn)}</span></div>)}
</div>
                      <p className="pt-0.5 text-[11px] text-slate-600">
                        ✅ <b>Material:</b> {materialLabel} · <b>Fit:</b> Standard Sarees, Suits & Lehengas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
          {/* qty + actions */}
          <div className="mt-5 flex items-center gap-4">
            <div className="flex items-center rounded-xl border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5" aria-label="Decrease quantity" data-testid="qty-minus"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center font-semibold" data-testid="qty-value">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(p.stock, q + 1))} className="p-2.5" aria-label="Increase quantity" data-testid="qty-plus"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => addToCart(p.id, qty)} disabled={p.stock <= 0} data-testid="pdp-add-to-cart" className="flex-1 rounded-xl bg-slate-900 font-semibold text-white hover:bg-slate-800 sm:flex-none sm:px-8">Add to Cart</Button>
            <Button onClick={buyNow} disabled={p.stock <= 0} data-testid="pdp-buy-now" className="flex-1 rounded-xl bg-brand font-semibold text-white hover:bg-brand-dark sm:flex-none sm:px-8">Buy Now</Button>
            <Button onClick={() => toggleWishlist(p.id)} variant="outline" size="icon" aria-label="Add to wishlist" data-testid="pdp-wishlist" className="rounded-xl">
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
                {(() => {
                const hiddenKeys = ["color_images", "pack_prices", "size_config"];
                const seen = new Map();
                (p.specifications || []).forEach((s) => {
                  const rawKey = (s.key || "").trim();
                  const lower = rawKey.toLowerCase();
                  if (!rawKey || hiddenKeys.includes(lower)) return;
                  const normKey = ["available colors", "colors", "color"].includes(lower) ? "color"
                                : ["available packs", "pack size", "packs"].includes(lower) ? "packs"
                                : ["available sizes", "sizes", "size"].includes(lower) ? "sizes"
                                : lower;
                  seen.set(normKey, {
                    key: normKey === "color" ? "Color" : normKey === "packs" ? "Pack Options" : normKey === "sizes" ? "Available Sizes" : rawKey,
                    value: s.value
                  });
                });
                return Array.from(seen.values()).map((s, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-muted-foreground">{s.key}</td>
                    <td className="py-2.5 text-slate-800">{s.value}</td>
                  </tr>
                ));
              })()}
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
