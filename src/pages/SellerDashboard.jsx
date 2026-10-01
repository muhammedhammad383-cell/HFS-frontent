import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, PlusCircle, ShoppingCart, Wallet, Store, LogOut, Boxes,
  TrendingUp, Clock, Trash2, Pencil, IndianRupee,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api, { inr, apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const STATUS = { placed: "text-blue-600", confirmed: "text-indigo-600", shipped: "text-amber-600", delivered: "text-green-600", cancelled: "text-rose-600" };

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className={`mb-2 grid h-10 w-10 place-items-center rounded-xl ${accent || "bg-accent text-brand-dark"}`}><Icon className="h-5 w-5" /></div>
      <p className="font-heading text-2xl font-black text-slate-900">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Overview() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/seller/dashboard").then(({ data }) => setD(data)); }, []);
  if (!d) return <Loader />;
  const pending = d.store?.verified === false;
  return (
    <div className="space-y-6">
      {pending && <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">⏳ Your seller account is pending admin approval. Your products will go live once approved.</div>}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={ShoppingCart} label="Total Orders" value={d.total_orders} />
        <Stat icon={Clock} label="Pending Orders" value={d.pending_orders} accent="bg-amber-100 text-amber-700" />
        <Stat icon={IndianRupee} label="Total Sales" value={inr(d.total_sales)} accent="bg-green-100 text-green-700" />
        <Stat icon={Wallet} label="Net Earnings" value={inr(d.net_earning)} accent="bg-indigo-100 text-indigo-700" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h3 className="mb-4 font-heading font-bold text-slate-900">Earnings (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={d.sales_chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" fontSize={12} /><YAxis fontSize={12} />
              <Tooltip formatter={(v) => inr(v)} />
              <Line type="monotone" dataKey="earning" stroke="#D97706" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 font-heading font-bold text-slate-900">Earnings Breakdown</h3>
            <Row label="Total Sales" value={inr(d.total_sales)} />
            <Row label="Commission" value={`- ${inr(d.total_commission)}`} />
            <Row label="Net Earning" value={inr(d.net_earning)} bold />
            <Row label="Completed" value={inr(d.completed_earning)} />
            <Row label="Pending" value={inr(d.pending_earning)} />
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-2 font-heading font-bold text-slate-900">Products</h3>
            <p className="text-sm text-slate-600">{d.approved_products} approved · {d.pending_products} pending</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const EMPTY_PRODUCT = { name: "", category_id: "", description: "", price: "", sale_price: "", stock: "", sku: "", images: [""], specifications: [{ key: "", value: "" }] };

function ProductForm({ initial, cats, onSave, onClose }) {
  const [f, setF] = useState(initial || EMPTY_PRODUCT);
  const save = () => {
    if (!f.name || !f.category_id || !f.price) { toast.error("Name, category and price are required"); return; }
    onSave({
      ...f, price: parseFloat(f.price), sale_price: f.sale_price ? parseFloat(f.sale_price) : null,
      stock: parseInt(f.stock || 0), images: f.images.filter(Boolean),
      specifications: f.specifications.filter((s) => s.key),
    });
  };
  return (
    <div className="space-y-4">
      <div><Label>Product Name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="mt-1" data-testid="pf-name" /></div>
      <div>
        <Label>Category</Label>
        <Select value={f.category_id} onValueChange={(v) => setF({ ...f, category_id: v })}>
          <SelectTrigger className="mt-1" data-testid="pf-category"><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Price (₹)</Label><Input type="number" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} className="mt-1" data-testid="pf-price" /></div>
        <div><Label>Sale Price</Label><Input type="number" value={f.sale_price || ""} onChange={(e) => setF({ ...f, sale_price: e.target.value })} className="mt-1" data-testid="pf-sale" /></div>
        <div><Label>Stock</Label><Input type="number" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} className="mt-1" data-testid="pf-stock" /></div>
      </div>
      <div><Label>SKU</Label><Input value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} className="mt-1" data-testid="pf-sku" /></div>
      <div><Label>Description</Label><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="mt-1" data-testid="pf-desc" /></div>
      <div>
        <Label>Image URLs</Label>
        {f.images.map((img, i) => (
          <Input key={i} value={img} placeholder="https://..." className="mt-1" onChange={(e) => { const im = [...f.images]; im[i] = e.target.value; setF({ ...f, images: im }); }} />
        ))}
        <button onClick={() => setF({ ...f, images: [...f.images, ""] })} className="mt-1 text-xs font-semibold text-brand-dark">+ Add another image</button>
      </div>
      <div>
        <Label>Specifications</Label>
        {f.specifications.map((s, i) => (
          <div key={i} className="mt-1 flex gap-2">
            <Input value={s.key} placeholder="Key" onChange={(e) => { const sp = [...f.specifications]; sp[i].key = e.target.value; setF({ ...f, specifications: sp }); }} />
            <Input value={s.value} placeholder="Value" onChange={(e) => { const sp = [...f.specifications]; sp[i].value = e.target.value; setF({ ...f, specifications: sp }); }} />
          </div>
        ))}
        <button onClick={() => setF({ ...f, specifications: [...f.specifications, { key: "", value: "" }] })} className="mt-1 text-xs font-semibold text-brand-dark">+ Add spec</button>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} className="bg-brand text-white hover:bg-brand-dark" data-testid="pf-save">Save Product</Button>
      </DialogFooter>
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState(null);
  const [cats, setCats] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const load = () => api.get("/seller/products").then(({ data }) => setProducts(data));
  useEffect(() => { load(); api.get("/categories").then(({ data }) => setCats(data)); }, []);

  const save = async (payload) => {
    try {
      if (editing) await api.put(`/seller/products/${editing.id}`, payload);
      else await api.post("/seller/products", payload);
      toast.success(editing ? "Product updated (pending re-approval)" : "Product added (pending approval)");
      setOpen(false); setEditing(null); load();
    } catch (e) { toast.error(apiError(e)); }
  };
  const del = async (id) => { await api.delete(`/seller/products/${id}`); toast.success("Deleted"); load(); };

  if (!products) return <Loader />;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-slate-900">My Products ({products.length})</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild><Button className="gap-1.5 rounded-xl bg-brand text-white hover:bg-brand-dark" data-testid="add-product-btn"><PlusCircle className="h-4 w-4" /> Add Product</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-lg overflow-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Product" : "Add New Product"}</DialogTitle></DialogHeader>
            <ProductForm initial={editing ? { ...editing, images: editing.images?.length ? editing.images : [""], specifications: editing.specifications?.length ? editing.specifications : [{ key: "", value: "" }] } : null} cats={cats} onSave={save} onClose={() => { setOpen(false); setEditing(null); }} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border" data-testid={`seller-product-${p.id}`}>
                <td className="p-3"><div className="flex items-center gap-2"><img src={p.images?.[0]} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="line-clamp-1 max-w-48 font-medium">{p.name}</span></div></td>
                <td className="p-3 font-semibold">{inr(p.sale_price || p.price)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3"><span className={`text-xs font-semibold capitalize ${p.status === "approved" ? "text-green-600" : p.status === "pending" ? "text-amber-600" : "text-rose-600"}`}>{p.status}</span></td>
                <td className="p-3"><div className="flex gap-2">
                  <button onClick={() => { setEditing(p); setOpen(true); }} data-testid={`edit-product-${p.id}`} className="text-slate-500 hover:text-brand"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => del(p.id)} data-testid={`delete-product-${p.id}`} className="text-slate-500 hover:text-rose-brand"><Trash2 className="h-4 w-4" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SellerOrders() {
  const [orders, setOrders] = useState(null);
  const load = () => api.get("/seller/orders").then(({ data }) => setOrders(data));
  useEffect(() => { load(); }, []);
  const setStatus = async (id, status) => { try { await api.put(`/seller/orders/${id}/status`, { status }); toast.success("Status updated"); load(); } catch (e) { toast.error(apiError(e)); } };
  if (!orders) return <Loader />;
  if (!orders.length) return <p className="py-12 text-center text-muted-foreground">No orders yet.</p>;
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border border-border bg-card p-4" data-testid={`seller-order-${o.id}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><div className="flex items-center gap-2"><img src="/logo.svg" alt="HFS" className="h-8 w-auto object-contain rounded-full" /><span className="font-bold text-lg text-brand-dark">HFS</span></div><span className={`ml-2 text-sm font-semibold capitalize ${STATUS[o.status]}`}>{o.status}</span></div>
            <Select value={["confirmed", "shipped", "delivered"].includes(o.status) ? o.status : ""} onValueChange={(v) => setStatus(o.id, v)}>
              <SelectTrigger className="w-40" data-testid={`order-status-${o.id}`}><SelectValue placeholder="Update status" /></SelectTrigger>
              <SelectContent><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="shipped">Shipped</SelectItem><SelectItem value="delivered">Delivered</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="mt-2 text-sm text-slate-600">{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>{o.address.city}, {o.address.state}</span><span>Earning: {inr(o.items.reduce((s, i) => s + i.seller_earning, 0))}</span></div>
        </div>
      ))}
    </div>
  );
}

function StoreSettings() {
  const { user, refresh } = useAuth();
  const [f, setF] = useState({ name: user?.store?.name || "", description: user?.store?.description || "", logo: "" });
  const save = async () => { try { await api.put("/seller/store", f); toast.success("Store updated"); refresh(); } catch (e) { toast.error(apiError(e)); } };
  return (
    <div className="max-w-lg rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-4 font-heading text-xl font-bold text-slate-900">Store Settings</h2>
      <div className="space-y-4">
        <div><Label>Store Name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="mt-1" data-testid="store-name-input" /></div>
        <div><Label>Description</Label><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="mt-1" data-testid="store-desc-input" /></div>
        <Button onClick={save} className="rounded-xl bg-brand text-white hover:bg-brand-dark" data-testid="save-store-btn">Save Changes</Button>
      </div>
    </div>
  );
}

export default function SellerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = [
    ["/seller", "Overview", LayoutDashboard, true],
    ["/seller/products", "Products", Package],
    ["/seller/orders", "Orders", ShoppingCart],
    ["/seller/store", "Store Settings", Store],
  ];
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="fixed hidden h-screen w-60 flex-col border-r border-border bg-slate-900 p-4 lg:flex">
          <div className="mb-6 px-2 font-heading text-xl font-extrabold text-white"><span className="text-brand-light">HFS</span>BAG <span className="text-xs font-normal text-slate-400">Seller</span></div>
          <nav className="flex-1 space-y-1">
            {nav.map(([to, label, Icon, end]) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand text-white" : "text-slate-300 hover:bg-white/10"}`}>
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
          </nav>
          <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10"><LogOut className="h-4 w-4" /> Logout</button>
        </aside>
        <main className="w-full lg:ml-60">
          <div className="border-b border-border bg-card px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <NavLink to="/" className="font-heading text-lg font-extrabold lg:hidden"><span className="text-brand">HFS</span>BAG</NavLink>
              <div className="ml-auto flex items-center gap-3"><span className="text-sm font-medium text-slate-700">{user?.name}</span></div>
            </div>
            <nav className="mt-2 flex gap-2 overflow-auto no-scrollbar lg:hidden">
              {nav.map(([to, label, Icon, end]) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${isActive ? "bg-brand text-white" : "bg-secondary text-slate-600"}`}><Icon className="h-3.5 w-3.5" />{label}</NavLink>
              ))}
            </nav>
          </div>
          <div className="p-4 sm:p-6">
            <Routes>
              <Route index element={<Overview />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<SellerOrders />} />
              <Route path="store" element={<StoreSettings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

const Loader = () => <div className="grid h-40 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" /></div>;
const Row = ({ label, value, bold }) => <div className={`flex justify-between py-1 text-sm ${bold ? "border-t border-border pt-2 font-bold text-slate-900" : "text-slate-600"}`}><span>{label}</span><span>{value}</span></div>;
