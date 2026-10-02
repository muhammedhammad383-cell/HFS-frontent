import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Store, Package, Tags, ShoppingCart, Ticket, Star, RotateCcw,
  Image, Settings, LogOut, Check, X, Trash2, Ban, IndianRupee, TrendingUp, Clock,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api, { inr, apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className={`mb-2 grid h-10 w-10 place-items-center rounded-xl ${accent}`}><Icon className="h-5 w-5" /></div>
      <p className="font-heading text-2xl font-black text-slate-900">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Overview() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/admin/dashboard").then(({ data }) => setD(data)); }, []);
  if (!d) return <Loader />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Users} label="Customers" value={d.total_customers} accent="bg-blue-100 text-blue-700" />
        <Stat icon={Store} label="Sellers" value={d.total_sellers} accent="bg-indigo-100 text-indigo-700" />
        <Stat icon={Package} label="Products" value={d.total_products} accent="bg-amber-100 text-amber-700" />
        <Stat icon={ShoppingCart} label="Orders" value={d.total_orders} accent="bg-purple-100 text-purple-700" />
        <Stat icon={IndianRupee} label="Total Sales" value={inr(d.total_sales)} accent="bg-green-100 text-green-700" />
        <Stat icon={TrendingUp} label="Commission" value={inr(d.total_commission)} accent="bg-teal-100 text-teal-700" />
        <Stat icon={Clock} label="Pending Orders" value={d.pending_orders} accent="bg-rose-100 text-rose-700" />
        <Stat icon={Store} label="Pending Approvals" value={d.pending_sellers + d.pending_products} accent="bg-orange-100 text-orange-700" />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 font-heading font-bold text-slate-900">Sales (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={d.sales_chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="date" fontSize={12} /><YAxis fontSize={12} />
            <Tooltip formatter={(v) => inr(v)} />
            <Bar dataKey="sales" fill="#D97706" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-3 font-heading font-bold text-slate-900">Recent Orders</h3>
          {d.recent_orders.map((o) => (
            <div key={o.id} className="flex justify-between border-b border-border py-2 text-sm last:border-0">
              <span className="font-medium">{o.order_number}</span><span className="capitalize text-muted-foreground">{o.status}</span><span className="font-semibold">{inr(o.total)}</span>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-3 font-heading font-bold text-slate-900">Recent Sellers</h3>
          {d.recent_sellers.map((s) => (
            <div key={s.id} className="flex justify-between border-b border-border py-2 text-sm last:border-0">
              <span className="font-medium">{s.name}</span><span className={`capitalize ${s.seller_status === "approved" ? "text-green-600" : "text-amber-600"}`}>{s.seller_status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataTable({ url, columns, testid }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { api.get(url).then(({ data }) => setRows(data)); }, [url]);
  if (!rows) return <Loader />;
  if (!rows.length) return <p className="py-12 text-center text-muted-foreground">No records found.</p>;
  return (
    <div className="overflow-auto rounded-2xl border border-border bg-card" data-testid={testid}>
      <table className="w-full text-sm">
        <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
          <tr>{columns.map((c) => <th key={c.key} className="p-3">{c.label}</th>)}</tr>
        </thead>
        <tbody>{rows.map((r, i) => <tr key={r.id || i} className="border-t border-border">{columns.map((c) => <td key={c.key} className="p-3">{c.render ? c.render(r) : r[c.key]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function Sellers() {
  const [rows, setRows] = useState(null);
  const load = () => api.get("/admin/sellers").then(({ data }) => setRows(data));
  useEffect(() => { load(); }, []);
  const decide = async (id, decision) => { await api.put(`/admin/sellers/${id}/decision`, { decision }); toast.success(`Seller ${decision}`); load(); };
  const block = async (id) => { await api.put(`/admin/users/${id}/block`); load(); };
  if (!rows) return <Loader />;
  return (
    <div className="space-y-3">
      {rows.map((s) => (
        <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4" data-testid={`admin-seller-${s.id}`}>
          <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-900 font-bold text-brand-light">{s.name?.[0]}</div>
          <div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{s.store?.name || s.name}</p><p className="text-xs text-muted-foreground">{s.email} · {s.product_count} products</p></div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${s.seller_status === "approved" ? "bg-green-100 text-green-700" : s.seller_status === "pending" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>{s.seller_status}</span>
          {s.seller_status !== "approved" && <Button size="sm" onClick={() => decide(s.id, "approved")} className="bg-trust text-white hover:bg-green-700" data-testid={`admin-seller-approve-button-${s.id}`}><Check className="h-4 w-4" /></Button>}
          {s.seller_status !== "rejected" && <Button size="sm" variant="outline" onClick={() => decide(s.id, "rejected")} data-testid={`admin-seller-reject-${s.id}`}><X className="h-4 w-4" /></Button>}
          <Button size="sm" variant="outline" onClick={() => block(s.id)} className={s.status === "blocked" ? "border-rose-brand text-rose-brand" : ""}><Ban className="h-4 w-4" /></Button>
        </div>
      ))}
    </div>
  );
}

function ProductApprovals() {
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState("all");
  const load = () => api.get(`/admin/products${filter !== "all" ? `?status=${filter}` : ""}`).then(({ data }) => setRows(data));
  useEffect(() => { load(); }, [filter]);
  const decide = async (id, decision) => { await api.put(`/admin/products/${id}/decision`, { decision }); toast.success(`Product ${decision}`); load(); };
  const flag = async (id, key, val) => { await api.put(`/admin/products/${id}/flags`, { [key]: val }); load(); };
  const del = async (id) => { await api.delete(`/admin/products/${id}`); load(); };
  if (!rows) return <Loader />;
  return (
    <div>
      <div className="mb-4 flex gap-2">
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${filter === s ? "bg-brand text-white" : "bg-secondary text-slate-600"}`} data-testid={`product-filter-${s}`}>{s}</button>
        ))}
      </div>
      <div className="space-y-2">
        {rows.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3" data-testid={`admin-product-${p.id}`}>
            <img src={p.images?.[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
            <div className="min-w-0 flex-1"><p className="line-clamp-1 font-medium text-slate-900">{p.name}</p><p className="text-xs text-muted-foreground">{p.store_name} · {inr(p.sale_price || p.price)}</p></div>
            <span className={`text-xs font-semibold capitalize ${p.status === "approved" ? "text-green-600" : p.status === "pending" ? "text-amber-600" : "text-rose-600"}`}>{p.status}</span>
            <label className="flex items-center gap-1 text-xs"><Switch checked={!!p.featured} onCheckedChange={(v) => flag(p.id, "featured", v)} /> Featured</label>
            {p.status !== "approved" && <Button size="sm" onClick={() => decide(p.id, "approved")} className="bg-trust text-white" data-testid={`admin-product-approve-${p.id}`}><Check className="h-4 w-4" /></Button>}
            {p.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => decide(p.id, "rejected")}><X className="h-4 w-4" /></Button>}
            <Button size="sm" variant="outline" onClick={() => del(p.id)} className="text-rose-brand"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Categories() {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState({ name: "", image: "", description: "" });
  const [open, setOpen] = useState(false);
  const load = () => api.get("/categories").then(({ data }) => setRows(data));
  useEffect(() => { load(); }, []);
  const save = async () => { try { await api.post("/admin/categories", { ...form, active: true }); toast.success("Category added"); setOpen(false); setForm({ name: "", image: "", description: "" }); load(); } catch (e) { toast.error(apiError(e)); } };
  const del = async (id) => { await api.delete(`/admin/categories/${id}`); load(); };
  if (!rows) return <Loader />;
  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h2 className="font-heading text-xl font-bold text-slate-900">Categories</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="rounded-xl bg-brand text-white hover:bg-brand-dark" data-testid="add-category-btn">+ Add Category</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" data-testid="cat-name" /></div>
              <div><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="mt-1" data-testid="cat-image" /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>
            </div>
            <DialogFooter><Button onClick={save} className="bg-brand text-white" data-testid="cat-save">Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3" data-testid={`admin-cat-${c.id}`}>
            <img src={c.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
            <div className="flex-1"><p className="font-medium text-slate-900">{c.name}</p><p className="text-xs text-muted-foreground">{c.product_count} products</p></div>
            <button onClick={() => del(c.id)} className="text-slate-400 hover:text-rose-brand"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminOrders() {
  const [rows, setRows] = useState(null);
  const load = () => api.get("/admin/orders").then(({ data }) => setRows(data));
  useEffect(() => { load(); }, []);
  const setStatus = async (id, status) => { await api.put(`/admin/orders/${id}/status`, { status }); load(); };
  if (!rows) return <Loader />;
  return (
    <div className="space-y-2">
      {rows.map((o) => (
        <div key={o.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="min-w-0 flex-1"><p className="font-heading font-bold text-slate-900">{o.order_number}</p><p className="text-xs text-muted-foreground">{o.customer_name} · {o.items.length} items · {inr(o.total)} · {o.payment_method.toUpperCase()}</p></div>
          <Select value={o.status} onValueChange={(v) => setStatus(o.id, v)}>
            <SelectTrigger className="w-40" data-testid={`admin-order-status-${o.id}`}><SelectValue /></SelectTrigger>
            <SelectContent>{["placed", "confirmed", "shipped", "delivered", "cancelled"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}

function Coupons() {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", min_order: "", max_discount: "" });
  const load = () => api.get("/admin/coupons").then(({ data }) => setRows(data));
  useEffect(() => { load(); }, []);
  const save = async () => { try { await api.post("/admin/coupons", { ...form, value: parseFloat(form.value), min_order: parseFloat(form.min_order || 0), max_discount: parseFloat(form.max_discount || 100000) }); toast.success("Coupon created"); setForm({ code: "", type: "percent", value: "", min_order: "", max_discount: "" }); load(); } catch (e) { toast.error(apiError(e)); } };
  const del = async (id) => { await api.delete(`/admin/coupons/${id}`); load(); };
  if (!rows) return <Loader />;
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-1">
        <h3 className="mb-3 font-heading font-bold text-slate-900">Create Coupon</h3>
        <div className="space-y-3">
          <Input placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} data-testid="coupon-code" />
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percent">Percent (%)</SelectItem><SelectItem value="flat">Flat (₹)</SelectItem></SelectContent></Select>
          <Input placeholder="Value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} data-testid="coupon-value" />
          <Input placeholder="Min order (₹)" type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} />
          <Input placeholder="Max discount (₹)" type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} />
          <Button onClick={save} className="w-full bg-brand text-white" data-testid="coupon-save">Create</Button>
        </div>
      </div>
      <div className="space-y-2 lg:col-span-2">
        {rows.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
            <div><p className="font-heading font-bold text-slate-900">{c.code}</p><p className="text-xs text-muted-foreground">{c.type === "percent" ? `${c.value}% off` : `${inr(c.value)} off`} · Min {inr(c.min_order)}</p></div>
            <button onClick={() => del(c.id)} className="text-slate-400 hover:text-rose-brand"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Banners() {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", link: "/products" });
  const load = () => api.get("/admin/banners").then(({ data }) => setRows(data));
  useEffect(() => { load(); }, []);
  const save = async () => { try { await api.post("/admin/banners", { ...form, active: true }); toast.success("Banner added"); setForm({ title: "", subtitle: "", image: "", link: "/products" }); load(); } catch (e) { toast.error(apiError(e)); } };
  const del = async (id) => { await api.delete(`/admin/banners/${id}`); load(); };
  if (!rows) return <Loader />;
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 font-heading font-bold text-slate-900">Add Banner</h3>
        <div className="space-y-3">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="banner-title" />
          <Input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <Input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} data-testid="banner-image" />
          <Input placeholder="Link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <Button onClick={save} className="w-full bg-brand text-white" data-testid="banner-save">Add Banner</Button>
        </div>
      </div>
      <div className="space-y-3 lg:col-span-2">
        {rows.map((b) => (
          <div key={b.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <img src={b.image} alt="" className="h-14 w-24 rounded-lg object-cover" />
            <div className="flex-1"><p className="font-medium text-slate-900">{b.title}</p><p className="text-xs text-muted-foreground">{b.subtitle}</p></div>
            <button onClick={() => del(b.id)} className="text-slate-400 hover:text-rose-brand"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Reviews() {
  const [rows, setRows] = useState(null);
  const load = () => api.get("/admin/reviews").then(({ data }) => setRows(data));
  useEffect(() => { load(); }, []);
  const del = async (id) => { await api.delete(`/admin/reviews/${id}`); load(); };
  if (!rows) return <Loader />;
  if (!rows.length) return <p className="py-12 text-center text-muted-foreground">No reviews.</p>;
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
          <div><p className="font-medium text-slate-900">{r.product_name} · {r.rating}★</p><p className="text-sm text-muted-foreground">{r.user_name}: {r.comment}</p></div>
          <button onClick={() => del(r.id)} className="text-slate-400 hover:text-rose-brand"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  );
}

function Returns() {
  const [rows, setRows] = useState(null);
  const load = () => api.get("/admin/returns").then(({ data }) => setRows(data));
  useEffect(() => { load(); }, []);
  const decide = async (id, status) => { await api.put(`/admin/returns/${id}`, { status }); toast.success(`Return ${status}`); load(); };
  if (!rows) return <Loader />;
  if (!rows.length) return <p className="py-12 text-center text-muted-foreground">No return requests.</p>;
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
          <div><p className="font-medium text-slate-900">{r.order_number}</p><p className="text-sm text-muted-foreground">{r.reason} · <span className="capitalize">{r.status}</span></p></div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => decide(r.id, "approved")} className="bg-trust text-white">Approve</Button>
            <Button size="sm" variant="outline" onClick={() => decide(r.id, "refunded")}>Refund</Button>
            <Button size="sm" variant="outline" onClick={() => decide(r.id, "rejected")}>Reject</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminSettings() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get("/admin/settings").then(({ data }) => setS(data)); }, []);
  const save = async () => { try { await api.put("/admin/settings", { cod_enabled: s.cod_enabled, commission_percent: parseFloat(s.commission_percent), delivery_charge: parseFloat(s.delivery_charge), free_delivery_above: parseFloat(s.free_delivery_above), razorpay_enabled: s.razorpay_enabled, cashfree_enabled: s.cashfree_enabled, legal_pages: s.legal_pages }); toast.success("Settings saved"); } catch (e) { toast.error(apiError(e)); } };
  if (!s) return <Loader />;
  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 font-heading font-bold text-slate-900">Commission & Charges</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><Label>Commission (%)</Label><Input type="number" value={s.commission_percent} onChange={(e) => setS({ ...s, commission_percent: e.target.value })} className="mt-1" data-testid="setting-commission" /></div>
          <div><Label>Delivery Charge (₹)</Label><Input type="number" value={s.delivery_charge} onChange={(e) => setS({ ...s, delivery_charge: e.target.value })} className="mt-1" /></div>
          <div><Label>Free Delivery Above (₹)</Label><Input type="number" value={s.free_delivery_above} onChange={(e) => setS({ ...s, free_delivery_above: e.target.value })} className="mt-1" /></div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 font-heading font-bold text-slate-900">Payment Settings</h3>
        <div className="space-y-3">
          <Toggle label="Cash on Delivery" checked={s.cod_enabled} onChange={(v) => setS({ ...s, cod_enabled: v })} testid="setting-cod" />
          <Toggle label="Razorpay" checked={s.razorpay_enabled} onChange={(v) => setS({ ...s, razorpay_enabled: v })} sub={s.integrations?.payments?.razorpay ? "Live keys configured" : "Architecture/test mode"} />
          <Toggle label="Cashfree" checked={s.cashfree_enabled} onChange={(v) => setS({ ...s, cashfree_enabled: v })} sub={s.integrations?.payments?.cashfree ? "Live keys configured" : "Architecture/test mode"} />
          <div className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">Shiprocket: {s.integrations?.shipping?.shiprocket ? "Live" : "Architecture/mock mode — add credentials in backend .env to go live"}</div>
        </div>
      </div>
      <Button onClick={save} className="rounded-xl bg-brand text-white hover:bg-brand-dark" data-testid="save-settings-btn">Save Settings</Button>
    </div>
  );
}

const Toggle = ({ label, checked, onChange, sub, testid }) => (
  <div className="flex items-center justify-between rounded-xl border border-border p-3">
    <div><p className="font-medium text-slate-900">{label}</p>{sub && <p className="text-xs text-muted-foreground">{sub}</p>}</div>
    <Switch checked={checked} onCheckedChange={onChange} data-testid={testid} />
  </div>
);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = [
    ["/admin", "Overview", LayoutDashboard, true],
    ["/admin/sellers", "Sellers", Store],
    ["/admin/products", "Products", Package],
    ["/admin/categories", "Categories", Tags],
    ["/admin/orders", "Orders", ShoppingCart],
    ["/admin/customers", "Customers", Users],
    ["/admin/coupons", "Coupons", Ticket],
    ["/admin/banners", "Banners", Image],
    ["/admin/reviews", "Reviews", Star],
    ["/admin/returns", "Returns", RotateCcw],
    ["/admin/settings", "Settings", Settings],
  ];
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="fixed hidden h-screen w-56 flex-col border-r border-border bg-slate-900 p-4 lg:flex">
          <div className="mb-6 px-2 font-heading text-xl font-extrabold text-white"><span className="text-brand-light">HFS</span> <span className="text-xs font-normal text-slate-400">Admin</span></div>
          <nav className="flex-1 space-y-0.5 overflow-auto">
            {nav.map(([to, label, Icon, end]) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-brand text-white" : "text-slate-300 hover:bg-white/10"}`}>
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
          </nav>
          <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10"><LogOut className="h-4 w-4" /> Logout</button>
        </aside>
        <main className="w-full lg:ml-56">
          <div className="border-b border-border bg-card px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <NavLink to="/" className="font-heading text-lg font-extrabold"><span className="text-brand">HFS</span></NavLink>
              <span className="text-sm font-medium text-slate-700">{user?.name}</span>
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
              <Route path="sellers" element={<Sellers />} />
              <Route path="products" element={<ProductApprovals />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<DataTable url="/admin/users?role=customer" testid="customers-table" columns={[{ key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "phone", label: "Phone" }, { key: "status", label: "Status", render: (r) => <span className="capitalize">{r.status}</span> }]} />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="banners" element={<Banners />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="returns" element={<Returns />} />
              <Route path="settings" element={<AdminSettings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

const Loader = () => <div className="grid h-40 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" /></div>;
