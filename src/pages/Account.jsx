import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, useParams, NavLink } from "react-router-dom";
import { Package, Heart, MapPin, Bell, RotateCcw, ChevronRight, Truck, Check, X, User } from "lucide-react";
import api, { inr, apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Loader = () => <div className="grid h-40 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" /></div>;
const Info = ({ label, value }) => <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium text-slate-800">{value}</p></div>;
const Row = ({ label, value, bold }) => <div className={`flex justify-between py-1 text-sm ${bold ? "border-t border-border pt-2 font-bold text-slate-900" : "text-slate-600"}`}><span>{label}</span><span>{value}</span></div>;
function EmptyState({ icon: Icon, title, cta, to }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border py-20 text-center">
      <Icon className="h-12 w-12 text-muted-foreground" />
      <p className="mt-3 font-heading text-lg font-bold text-slate-900">{title}</p>
      <Link to={to}><Button className="mt-4 rounded-xl bg-brand text-white hover:bg-brand-dark">{cta}</Button></Link>
    </div>
  );
}

const STATUS_COLORS = {
  placed: "bg-blue-100 text-blue-700", confirmed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-amber-100 text-amber-700", delivered: "bg-green-100 text-green-700",
  cancelled: "bg-rose-100 text-rose-700", awaiting_payment: "bg-slate-100 text-slate-600",
};

function StatusBadge({ status }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[status] || "bg-slate-100"}`}>{status?.replace("_", " ")}</span>;
}

function SideNav() {
  const items = [
    ["/account/profile", "Profile", User]
    ["/account/orders", "My Orders", Package],
    ["/account/wishlist", "Wishlist", Heart],
    ["/account/returns", "Returns", RotateCcw],
    ["/account/notifications", "Notifications", Bell],
  ];
  return (
    <aside className="w-full lg:w-56 lg:shrink-0">
      <div className="flex gap-2 overflow-auto rounded-2xl border border-border bg-card p-2 no-scrollbar lg:flex-col">
        {items.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} data-testid={`acc-nav-${label.toLowerCase().replace(" ", "-")}`}
            className={({ isActive }) => `flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand text-white" : "text-slate-600 hover:bg-secondary"}`}>
            <Icon className="h-4 w-4" /> {label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/auth/profile", { name, email, phone });
      toast.success("Profile successfully update ho gaya!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border max-w-xl space-y-4">
      <div>
        <h2 className="text-lg font-bold">Profile Details</h2>
        <p className="text-xs text-muted-foreground">Apna name, email aur mobile number update karein</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Aapka Name" 
            required 
          />
        </div>

        <div>
          <Label>Email Address</Label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="name@example.com" 
            required 
          />
        </div>

        <div>
          <Label>Phone Number</Label>
          <Input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="Mobile number" 
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Updating..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}


function Orders() {
  const [orders, setOrders] = useState(null);
  useEffect(() => {
    api.get("/orders")
      .then((res) => {
        const data = Array.isArray(res) ? res : (res && res.data ? res.data : []);
        setOrders(data);
      })
      .catch(() => setOrders([]));
  }, []);
  if (!orders) return <Loader />;
  if (orders.length === 0) return <EmptyState icon={Package} title="No orders yet" cta="Start Shopping" to="/products" />;
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Link key={o.id} to={`/account/orders/${o.id}`} data-testid={`order-row-${o.id}`} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary"><img src={o.items[0]?.image} alt="" className="h-full w-full object-cover" /></div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><span className="font-heading font-bold text-slate-900">{o.order_number}</span><StatusBadge status={o.status} /></div>
            <p className="line-clamp-1 text-sm text-slate-600">{o.items.map((i) => i.name).join(", ")}</p>
            <p className="text-xs text-muted-foreground">{o.items.length} item(s) · {new Date(o.created_at).toLocaleDateString("en-IN")}</p>
          </div>
          <div className="text-right"><p className="font-bold text-slate-900">{inr(o.total)}</p><ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" /></div>
        </Link>
      ))}
    </div>
  );
}

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [o, setO] = useState(null);
  const load = () => api.get(`/orders/${id}`).then((res) => { const data = Array.isArray(res) ? res : (res?.data || []); setO(data); });
  useEffect(() => { load(); }, [id]);
  if (!o) return <Loader />;

  const steps = ["placed", "confirmed", "shipped", "delivered"];
  const curIdx = steps.indexOf(o.status);

  const cancel = async () => {
    try { await api.post(`/orders/${id}/cancel`); toast.success("Order cancelled"); load(); }
    catch (e) { toast.error(apiError(e)); }
  };
  const requestReturn = async () => {
    try { await api.post("/returns", { order_id: id, reason: "Product issue" }); toast.success("Return requested"); }
    catch (e) { toast.error(apiError(e)); }
  };

  return (
    <div className="space-y-5">
      <button onClick={() => navigate("/account/orders")} className="text-sm font-semibold text-brand-dark">← All orders</button>
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
              <h2 className="font-heading text-xl font-bold text-slate-900">{o.order_number}</h2>
              <p className="text-sm text-muted-foreground">
                Placed on {new Date(o.created_at).toLocaleDateString("en-IN")}
              </p>
            </div>
          <StatusBadge status={o.status} />
        </div>

        {o.status !== "cancelled" && (
          <div className="mt-6 flex items-center justify-between">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1">
                  <div className={"grid h-9 w-9 place-items-center rounded-full " + (i <= curIdx ? "bg-trust text-white" : "bg-secondary text-muted-foreground")}>
                    {i <= curIdx ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className="text-[11px] font-medium capitalize text-slate-600">{s}</span>
                </div>
                {i < steps.length - 1 && <div className={"h-0.5 flex-1 " + (i < curIdx ? "bg-trust" : "bg-secondary")} />}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {o.shipment && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-3 flex items-center gap-2 font-heading font-bold text-slate-900"><Truck className="h-5 w-5 text-brand" /> Shipment Details</h3>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <Info label="Courier" value={o.shipment.courier_name} />
            <Info label="AWB Number" value={o.shipment.awb_code} />
            <Info label="Tracking Number" value={o.shipment.tracking_number} />
            <Info label="Status" value={o.shipment.status?.replace("_", " ")} />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-3 font-heading font-bold text-slate-900">Items</h3>
        {o.items.map((it) => (
          <div key={it.product_id} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
            <div className="h-14 w-14 overflow-hidden rounded-lg bg-secondary"><img src={it.image} alt="" className="h-full w-full object-cover" /></div>
            <div className="flex-1"><p className="line-clamp-1 font-medium text-slate-900">{it.name}</p><p className="text-xs text-muted-foreground">Qty {it.qty} · {it.store_name}</p></div>
            <span className="font-semibold">{inr(it.line_total)}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-3 font-heading font-bold text-slate-900">Delivery Address</h3>
          <p className="text-sm text-slate-700">{o.address.full_name}<br />{o.address.address_line}, {o.address.landmark}<br />{o.address.city}, {o.address.state} - {o.address.pincode}<br />📞 {o.address.mobile}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-3 font-heading font-bold text-slate-900">Payment Summary</h3>
          <Row label="Subtotal" value={inr(o.subtotal)} />
          {o.discount > 0 && <Row label="Discount" value={`- ${inr(o.discount)}`} />}
          <Row label="Delivery" value={o.delivery_charge === 0 ? "FREE" : inr(o.delivery_charge)} />
          <Row label="Total" value={inr(o.total)} bold />
          <p className="mt-2 text-xs text-muted-foreground">Method: {o.payment_method.toUpperCase()} · {o.payment_status?.replace("_", " ")}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {["placed", "confirmed", "awaiting_payment"].includes(o.status) && (
          <Button onClick={cancel} variant="outline" className="rounded-xl border-rose-brand text-rose-brand hover:bg-rose-50" data-testid="cancel-order-btn"><X className="mr-1 h-4 w-4" /> Cancel Order</Button>
        )}
        {o.status === "delivered" && (
          <Button onClick={requestReturn} variant="outline" className="rounded-xl" data-testid="return-order-btn"><RotateCcw className="mr-1 h-4 w-4" /> Request Return</Button>
        )}
      </div>
    </div>
  );
}

function Wishlist() {
  const { wishlist } = useCart();
  if (!wishlist.length) return <EmptyState icon={Heart} title="Your wishlist is empty" cta="Browse Products" to="/products" />;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
      {wishlist.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

function Returns() {
  const [returns, setReturns] = useState(null);
  useEffect(() => { api.get("/returns").then((res) => { const data = Array.isArray(res) ? res : (res?.data || []);  setReturns(data)); }, []);
  if (!returns) return <Loader />;
  if (!returns.length) return <EmptyState icon={RotateCcw} title="No return requests" cta="View Orders" to="/account/orders" />;
  return (
    <div className="space-y-3">
      {returns.map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
          <div><p className="font-semibold text-slate-900">{r.order_number}</p><p className="text-sm text-muted-foreground">{r.reason}</p></div>
          <StatusBadge status={r.status} />
        </div>
      ))}
    </div>
  );
}

function Notifications() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    api.get("/notifications")
      .then((res) => {
        const data = Array.isArray(res) ? res : (res && res.data ? res.data : []);
        setItems(data);
      })
      .catch(() => setItems([]));
    api.post("/notifications/read-all").catch(() => {});
  }, []);
  if (!items) return <Loader />;
  if (items.length === 0) return <EmptyState icon={Bell} title="No notifications yet" cta="Go Home" to="/" />;
  return (
    <div className="space-y-2">
      {items.map((n) => (
        <div key={n.id} className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-slate-800">{n.message}</p>
          <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("en-IN")}</p>
        </div>
      ))}
    </div>
  );
}

export default function Account() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-heading text-2xl font-bold text-slate-900">Hi, {user?.name?.split(" ")[0]} 👋</h1>
      <p className="mb-6 text-sm text-muted-foreground">Manage your orders, wishlist and account</p>
      <div className="flex flex-col gap-6 lg:flex-row">
        <SideNav />
        <div className="min-w-0 flex-1">
          <Routes>
            <Route index element={<Orders />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="returns" element={<Returns />} />
            <Route path="notifications" element={<Notifications />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

