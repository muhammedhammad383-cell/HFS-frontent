
function printInvoice(order) {
  const itemsHtml = (order.items || []).map((it, idx) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${idx + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${it.name || 'Product'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${it.qty || 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${(it.price || 0).toLocaleString()}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${((it.price || 0) * (it.qty || 1)).toLocaleString()}</td>
    </tr>
  `).join('');

  const addr = order.address || {};
  const addrStr = [addr.address || addr.address_line, addr.landmark, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');

  const html = `
  <html>
  <head>
    <title>Invoice - ${order.order_number || order.id}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #111; max-width: 800px; margin: 0 auto; }
      .header { display: flex; justify-content: space-between; border-bottom: 2px solid #222; padding-bottom: 16px; margin-bottom: 20px; }
      .brand { font-size: 24px; font-weight: bold; }
      .inv-title { font-size: 20px; text-align: right; font-weight: 600; color: #444; }
      .details-grid { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 14px; line-height: 1.5; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
      th { background: #f4f4f5; padding: 8px; text-align: left; border-bottom: 2px solid #ddd; }
      .total-box { margin-left: auto; width: 280px; font-size: 14px; line-height: 1.8; }
      .total-row { display: flex; justify-content: space-between; }
      .grand-total { font-size: 16px; font-weight: bold; border-top: 2px solid #222; padding-top: 6px; margin-top: 6px; }
      .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 16px; }
      @media print { .no-print { display: none; } }
    </style>
  </head>
  <body>
    <div class="no-print" style="text-align: right; margin-bottom: 16px;">
      <button onclick="window.print()" style="padding: 8px 16px; background: #000; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Print / Save as PDF</button>
    </div>
    <div class="header">
      <div>
        <div class="brand">HFS Bazaar</div>
        <div style="font-size: 12px; color: #444; margin-top: 2px;">MSME / Udyam: UDYAM-MH-19-0412505</div>
        <div style="font-size: 13px; color: #666;">Store & Living Organizers</div>
      </div>
      <div class="inv-title">
        RETAIL INVOICE
        <div style="font-size: 13px; font-weight: normal;">Order #: ${order.order_number || order.id}</div>
        <div style="font-size: 13px; font-weight: normal;">Date: ${new Date(order.created_at || Date.now()).toLocaleDateString('en-IN')}</div>
      </div>
    </div>
    <div class="details-grid">
      <div>
        <strong>Billed / Delivered To:</strong><br/>
        ${order.customer_name || addr.name || 'Customer'}<br/>
        ${addrStr || 'N/A'}<br/>
        Phone: ${addr.phone || order.phone || 'N/A'}
      </div>
      <div style="text-align: right;">
        <strong>Payment Method:</strong> ${(order.payment_method || 'COD').toUpperCase()}<br/>
        <strong>Status:</strong> ${(order.status || 'Placed').toUpperCase()}
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div class="total-box">
      <div class="total-row"><span>Subtotal:</span><span>₹${(order.subtotal || order.total || 0).toLocaleString()}</span></div>
      ${order.discount ? `<div class="total-row"><span>Discount:</span><span>-₹${order.discount.toLocaleString()}</span></div>` : ''}
      <div class="total-row"><span>Delivery:</span><span>₹${(order.delivery_charge ?? (order.delivery || 0)).toLocaleString()}</span></div>
      <div class="total-row grand-total"><span>Total Paid:</span><span>₹${(order.total || 0).toLocaleString()}</span></div>
    </div>
    <div class="footer">
      Thank you for shopping with HFS Bazaar! For support, visit hfsbazaar.in
    </div>
  </body>
  </html>
  `;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

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
  const navItems = [
    { to: "/account/profile", label: "Profile", Icon: User },
    { to: "/account/orders", label: "My Orders", Icon: Package },
    { to: "/account/wishlist", label: "Wishlist", Icon: Heart },
    { to: "/account/returns", label: "Returns", Icon: RotateCcw },
    { to: "/account/notifications", label: "Notifications", Icon: Bell },
  ];
  return (
    <aside className="w-full lg:w-56 lg:shrink-0">
      <div className="flex gap-2 overflow-auto rounded-2xl border border-border bg-card p-2 no-scrollbar lg:flex-col">
        {navItems.map((item) => {
          if (!item) return null;
          const { to, label, Icon } = item;
          return (
            <NavLink
              key={to}
              to={to}
              data-testid={`acc-nav-${label.toLowerCase().replace(" ", "-")}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-brand text-white" : "text-slate-600 hover:bg-secondary"
                }`
              }
            >
              {Icon && <Icon className="h-4 w-4" />} {label}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}
function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(() => {
    const raw = String(user?.phone || "").replace(/\D/g, "");
    return raw.length > 10 ? raw.slice(-10) : raw;
  });
  const [loading, setLoading] = useState(false);

  const [verifiedEmail, setVerifiedEmail] = useState(() => localStorage.getItem("hfs_verified_email") || user?.email || "");
  const [verifiedPhone, setVerifiedPhone] = useState(() => localStorage.getItem("hfs_verified_phone") || String(user?.phone || "").replace(/\D/g, "").slice(-10) || "");

  const [emailOtpSent, setEmailOtpSent] = useState("");
  const [emailRealSent, setEmailRealSent] = useState(false);
  const [phoneRealSent, setPhoneRealSent] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState("");
  const [phoneOtpInput, setPhoneOtpInput] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      const cleanPh = String(user.phone || "").replace(/\D/g, "").slice(-10);
      setPhone(cleanPh);
      if (user.email) setVerifiedEmail(user.email);
      if (cleanPh.length === 10) setVerifiedPhone(cleanPh);
    }
  }, [user]);

  const origEmail = String(user?.email || "").trim().toLowerCase();
  const origPhone = String(user?.phone || "").replace(/\D/g, "").slice(-10);

  const cleanEmail = String(email || "").trim();
  const cleanPhone = String(phone || "").replace(/\D/g, "").slice(-10);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
  const isValidIndianPhone = /^[6-9]\d{9}$/.test(cleanPhone);

  const emailChanged = cleanEmail.toLowerCase() !== origEmail;
  const phoneChanged = cleanPhone !== origPhone;

  // Existing account email/phone is already verified; OTP is ONLY required when changed!
  const isEmailVerified = Boolean(
    isValidEmail && (
      (!emailChanged && origEmail) ||
      (verifiedEmail && verifiedEmail.toLowerCase() === cleanEmail.toLowerCase())
    )
  );
  const isPhoneVerified = Boolean(
    isValidIndianPhone && (
      (!phoneChanged && origPhone.length === 10) ||
      (verifiedPhone && verifiedPhone === cleanPhone)
    )
  );

  const sendEmailOtp = async () => {
    if (!isValidEmail) return toast.error("Please enter a valid new Email Address");
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setEmailOtpSent(code);
    setEmailOtpInput("");
    try {
      const { data } = await api.post("/auth/send-otp", { email: cleanEmail, type: "email", otp: code });
      if (data?.email_sent) {
        setEmailRealSent(true);
        toast.success(`6-digit OTP sent to ${cleanEmail}!`, { duration: 8000 });
        return;
      }
    } catch (e) {}
    toast.success(`Verification OTP for new email ${cleanEmail} is: ${code}`, { duration: 10000 });
  };

  const confirmEmailOtp = () => {
    if (emailOtpInput.trim() === emailOtpSent && emailOtpSent) {
      setVerifiedEmail(cleanEmail);
      localStorage.setItem("hfs_verified_email", cleanEmail);
      setEmailOtpSent("");
      setEmailOtpInput("");
      toast.success("New Email Address verified! ✓ Now tap Save Changes.");
    } else {
      toast.error("Invalid Email OTP");
    }
  };

  const sendPhoneOtp = async () => {
    if (!isValidIndianPhone) return toast.error("Please enter a valid 10-digit Indian Mobile Number (starting with 6-9)");
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setPhoneOtpSent(code);
    setPhoneOtpInput("");
    try {
      const { data } = await api.post("/auth/send-otp", { phone: cleanPhone, type: "phone", otp: code });
      if (data?.sms_sent) {
        setPhoneRealSent(true);
        toast.success(`6-digit OTP sent via SMS to +91 ${cleanPhone}!`, { duration: 8000 });
        return;
      }
    } catch (e) {}
    toast.success(`Verification OTP for new mobile +91 ${cleanPhone} is: ${code}`, { duration: 10000 });
  };

  const confirmPhoneOtp = () => {
    if (phoneOtpInput.trim() === phoneOtpSent && phoneOtpSent) {
      setVerifiedPhone(cleanPhone);
      localStorage.setItem("hfs_verified_phone", cleanPhone);
      setPhoneOtpSent("");
      setPhoneOtpInput("");
      toast.success("New Mobile Number verified! ✓ Now tap Save Changes.");
    } else {
      toast.error("Invalid Mobile OTP");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isValidEmail) return toast.error("Please enter a valid Email Address");
    if (emailChanged && !isEmailVerified) {
      if (!emailOtpSent) sendEmailOtp();
      return toast.error("You changed your Email — please verify the new Email with OTP before saving!");
    }
    if (cleanPhone && !isValidIndianPhone) {
      return toast.error("Please enter a valid 10-digit Indian Mobile Number");
    }
    if (phoneChanged && cleanPhone && !isPhoneVerified) {
      if (!phoneOtpSent) sendPhoneOtp();
      return toast.error("You changed your Mobile Number — please verify the new number with OTP before saving!");
    }
    setLoading(true);
    try {
      await api.put("/auth/profile", {
        name,
        email: cleanEmail,
        phone: cleanPhone,
        email_verified: true,
        phone_verified: Boolean(cleanPhone)
      });
      if (cleanEmail) localStorage.setItem("hfs_verified_email", cleanEmail);
      if (cleanPhone) localStorage.setItem("hfs_verified_phone", cleanPhone);
      toast.success("Profile updated successfully!");
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
        <p className="text-xs text-muted-foreground">Manage your personal information and contact details</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Email Address</Label>
            {isEmailVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-300">
                ✓ Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                New Email — Verify with OTP
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="flex-1"
            />
            {!isEmailVerified && (
              <Button type="button" variant="outline" onClick={sendEmailOtp} className="shrink-0 border-amber-500 text-amber-900 hover:bg-amber-50 text-xs font-bold">
                {emailOtpSent ? "Resend OTP" : "Verify New Email"}
              </Button>
            )}
          </div>
          {emailOtpSent && !isEmailVerified && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-2.5 space-y-2">
              {!emailRealSent && (<div className="flex items-center justify-between text-xs bg-white px-2.5 py-1 rounded border border-amber-200">
                <span className="text-slate-600">OTP Code: <strong className="text-amber-900 tracking-wider">{emailOtpSent}</strong></span>
                <button type="button" onClick={() => setEmailOtpInput(emailOtpSent)} className="text-[11px] font-bold text-emerald-700 underline">Auto-Fill</button>
              </div>)}
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Email OTP"
                  value={emailOtpInput}
                  onChange={(e) => setEmailOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="bg-white text-xs font-bold tracking-widest"
                />
                <Button type="button" onClick={confirmEmailOtp} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0">
                  Confirm OTP
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Mobile Number (+91)</Label>
            {isPhoneVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-300">
                ✓ Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                {phoneChanged && cleanPhone.length === 10 ? "New Mobile — Verify with OTP" : "Enter 10-digit Mobile"}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex flex-1 items-center rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
              <span className="pl-3 pr-2 text-xs font-bold text-slate-500 border-r border-slate-200">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={cleanPhone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                className="w-full bg-transparent px-3 py-2 text-sm outline-none"
              />
            </div>
            {!isPhoneVerified && cleanPhone.length === 10 && (
              <Button type="button" variant="outline" onClick={sendPhoneOtp} className="shrink-0 border-amber-500 text-amber-900 hover:bg-amber-50 text-xs font-bold">
                {phoneOtpSent ? "Resend OTP" : "Verify New Mobile"}
              </Button>
            )}
          </div>
          {phoneOtpSent && !isPhoneVerified && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-2.5 space-y-2">
              {!phoneRealSent && (<div className="flex items-center justify-between text-xs bg-white px-2.5 py-1 rounded border border-amber-200">
                <span className="text-slate-600">Mobile OTP: <strong className="text-amber-900 tracking-wider">{phoneOtpSent}</strong></span>
                <button type="button" onClick={() => setPhoneOtpInput(phoneOtpSent)} className="text-[11px] font-bold text-emerald-700 underline">Auto-Fill</button>
              </div>)}
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Mobile OTP"
                  value={phoneOtpInput}
                  onChange={(e) => setPhoneOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="bg-white text-xs font-bold tracking-widest"
                />
                <Button type="button" onClick={confirmPhoneOtp} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0">
                  Confirm OTP
                </Button>
              </div>
            </div>
          )}
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
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary"><img src={o.items?.[0]?.image || "/placeholder.png"} alt="" className="h-full w-full object-cover" /></div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><span className="font-heading font-bold text-slate-900">{o.order_number}</span><StatusBadge status={o.status} /></div>
            <p className="line-clamp-1 text-sm text-slate-600">{(o.items || []).map((i) => i?.name || "").join(", ")}</p>
            <p className="text-xs text-muted-foreground">{(o.items || []).length} item(s) · {new Date(o.created_at).toLocaleDateString("en-IN")}</p>
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
              <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <h2 className="font-heading text-xl font-bold text-slate-900">{o.order_number}</h2>
              <button
                onClick={() => printInvoice(o)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
              >
                Download Invoice
              </button>
            </div>
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

      {(o.shipment || o.status === "shipped" || o.status === "delivered") && (() => {
        const sh = o.shipment || {};
        const awb = sh.awb_code || sh.tracking_number || "";
        const trackUrl = sh.tracking_url || (awb ? `https://shiprocket.co/tracking/${awb}` : "");
        return (
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-heading font-bold text-slate-900">
                <Truck className="h-5 w-5 text-brand" /> Shipment & Live Tracking
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await api.get(`/orders/${o.id}/track`);
                      if (typeof load === "function") load();
                      else window.location.reload();
                    } catch (e) {
                      window.location.reload();
                    }
                  }}
                  className="text-xs"
                >
                  🔄 Refresh Status
                </Button>
                {trackUrl && (
                  <a
                    href={trackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-xl bg-brand px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand-dark"
                  >
                    📍 Track Live Package ↗
                  </a>
                )}
              </div>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Courier Partner" value={sh.courier_name || "Assigning courier partner..."} />
              <Info label="AWB / Tracking No." value={awb || "Generating AWB..."} />
              <Info label="Shipment Status" value={(sh.status || o.status || "processing").replace(/_/g, " ").toUpperCase()} />
              {sh.edd && <Info label="Estimated Delivery" value={sh.edd} />}
            </div>

            {!awb && o.status !== "cancelled" && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Your parcel is packed and ready for courier pickup. Live AWB tracking link will appear here as soon as the courier scans the package.
              </p>
            )}

            {Array.isArray(sh.scans) && sh.scans.length > 0 && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Live Courier Updates</p>
                <div className="space-y-2">
                  {sh.scans.slice(0, 6).map((sc, idx) => (
                    <div key={idx} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-xs">
                      <span className="font-medium text-slate-800">
                        {sc.activity || sc.status} {sc.location ? `• ${sc.location}` : ""}
                      </span>
                      <span className="text-slate-500">{sc.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-3 font-heading font-bold text-slate-900">Items</h3>
        {o.items.map((it) => (
          <div key={it.product_id} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
            <div className="h-14 w-14 overflow-hidden rounded-lg bg-secondary"><img src={it.image} alt="" className="h-full w-full object-cover" /></div>
            <div className="flex-1"><p className="line-clamp-1 font-medium text-slate-900">{it.name}</p><p className="text-xs text-muted-foreground">Qty {it.qty}</p></div>
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
  useEffect(() => { api.get("/returns").then((res) => { const data = Array.isArray(res) ? res : (res?.data || []); setReturns(data); }); }, []);
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

