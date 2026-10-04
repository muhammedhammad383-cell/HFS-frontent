import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Check, Wallet, CreditCard, Banknote } from "lucide-react";
import api, { inr, apiError } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Checkout() {
  const { cart, refreshCart, cartLoaded } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ cod_enabled: true, razorpay_enabled: true, cashfree_enabled: true });
  const [addr, setAddr] = useState({ full_name: user?.name || "", mobile: user?.phone || "", pincode: "", state: "", city: "", address_line: "", landmark: "" });
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [method, setMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [justPlaced, setJustPlaced] = useState(false);

  useEffect(() => {
    api.get("/settings/public").then(({ data }) => {
      setSettings(data);
      setMethod(data.cod_enabled ? "cod" : "razorpay");
    });
  }, []);

  useEffect(() => { refreshCart(); /* eslint-disable-next-line */ }, []);

  const delivery = cart.subtotal >= (settings.free_delivery_above || 999) ? 0 : (settings.delivery_charge || 49);
  const total = Math.max(0, cart.subtotal - discount + delivery);

  const applyCoupon = async () => {
    try {
      const { data } = await api.post("/coupons/validate", { code: coupon, subtotal: cart.subtotal });
      setDiscount(data.discount); setAppliedCoupon(data.code);
      toast.success(`Coupon applied! You saved ${inr(data.discount)}`);
    } catch (e) { toast.error(apiError(e)); setDiscount(0); setAppliedCoupon(""); }
  };

  const validAddr = addr.full_name && addr.mobile.length >= 10 && addr.pincode.length === 6 && addr.state && addr.city && addr.address_line;

    const placeOrder = async () => {
    if (!validAddr) return toast.error("Please fill all required address fields");
    setPlacing(true);
    try {
      const { data } = await api.post("/orders/checkout", {
        address: addr, payment_method: method, coupon_code: appliedCoupon
      });

      if (method === "cod") {
        setJustPlaced(true);
        await refreshCart();
        toast.success("Order placed successfully!");
        navigate(`/account/orders/${data.order_id}`);
      } else if (method === "razorpay") {
        if (!window.Razorpay) {
          toast.error("Razorpay SDK load nahi hua. Page refresh karein.");
          return;
        }

        const options = {
          key: data.payment_info?.key_id,
          amount: data.payment_info?.amount,
          currency: data.payment_info?.currency || "INR",
          name: "HFS Bazaar",
          description: "Order Payment",
          order_id: data.payment_info?.order_id,
          handler: async function (response) {
            try {
              await api.post("/orders/verify-payment", {
                order_id: data.order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              setJustPlaced(true);
              await refreshCart();
              toast.success("Payment successful! Order confirmed.");
              navigate(`/account/orders/${data.order_id}`);
            } catch (err) {
              toast.error(apiError(err) || "Payment verification failed");
            }
          },
          prefill: {
            name: addr.full_name,
            contact: addr.mobile
          },
          theme: {
            color: "#0f172a"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (resp) {
          toast.error(resp.error?.description || "Payment failed");
        });
        rzp.open();
      }
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setPlacing(false);
    }
  };

  const methods = [
    { id: "cod", label: "Cash on Delivery", sub: "Pay when you receive", icon: Banknote, show: settings.cod_enabled },
    { id: "razorpay", label: "Razorpay", sub: "UPI, Cards, Net Banking, Wallets", icon: Wallet, show: settings.razorpay_enabled },
    { id: "cashfree", label: "Cashfree", sub: "UPI, Cards, Net Banking", icon: CreditCard, show: settings.cashfree_enabled },
  ].filter((m) => m.show);

  if (!cartLoaded) {
    return <div className="grid min-h-[50vh] place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" /></div>;
  }
  if (!cart.items.length && !justPlaced) {
    return (
      <div className="mx-auto grid max-w-md place-items-center px-4 py-24 text-center">
        <h2 className="font-heading text-xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground">Add products before checking out</p>
        <Button onClick={() => navigate("/products")} className="mt-5 rounded-xl bg-brand text-white hover:bg-brand-dark">Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-heading text-2xl font-bold text-slate-900">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Address */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 font-heading font-bold text-slate-900">Delivery Address</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name *" v={addr.full_name} set={(v) => setAddr({ ...addr, full_name: v })} testid="addr-name" />
              <Field label="Mobile Number *" v={addr.mobile} set={(v) => setAddr({ ...addr, mobile: v })} testid="addr-mobile" />
              <Field label="Pincode *" v={addr.pincode} set={(v) => setAddr({ ...addr, pincode: v })} testid="addr-pincode" />
              <Field label="City *" v={addr.city} set={(v) => setAddr({ ...addr, city: v })} testid="addr-city" />
              <Field label="State *" v={addr.state} set={(v) => setAddr({ ...addr, state: v })} testid="addr-state" />
              <Field label="Landmark" v={addr.landmark} set={(v) => setAddr({ ...addr, landmark: v })} testid="addr-landmark" />
              <div className="sm:col-span-2">
                <Field label="Full Address *" v={addr.address_line} set={(v) => setAddr({ ...addr, address_line: v })} testid="addr-line" />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 font-heading font-bold text-slate-900">Payment Method</h3>
            <div className="space-y-2.5">
              {methods.map((m) => (
                <button key={m.id} onClick={() => setMethod(m.id)} data-testid={`payment-${m.id}`}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${method === m.id ? "border-brand bg-accent" : "border-border bg-white"}`}>
                  <m.icon className="h-5 w-5 text-brand-dark" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.sub}</p>
                  </div>
                  {method === m.id && <Check className="h-5 w-5 text-brand" />}
                </button>
              ))}
            </div>
            {method !== "cod" && (
              <p className="mt-3 rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
                Payment gateway runs in secure test/architecture mode. Live Razorpay & Cashfree keys can be added later without code changes.
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-40 space-y-4 rounded-2xl border border-border bg-card p-6">
            <h3 className="font-heading font-bold text-slate-900">Order Summary</h3>
            <div className="max-h-40 space-y-2 overflow-auto">
              {cart.items.map((it) => (
                <div key={it.product_id} className="flex items-center gap-2 text-sm">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-secondary"><img src={it.image} alt="" className="h-full w-full object-cover" /></div>
                  <span className="line-clamp-1 flex-1 text-slate-700">{it.name}</span>
                  <span className="font-medium">×{it.qty}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" className="pl-8" data-testid="coupon-input" />
              </div>
              <Button onClick={applyCoupon} variant="outline" data-testid="apply-coupon-btn">Apply</Button>
            </div>
            <p className="text-xs text-muted-foreground">Try <b>WELCOME100</b> or <b>SAVE20</b></p>
            <div className="border-t border-border pt-3 text-sm">
              <Row label="Subtotal" value={inr(cart.subtotal)} />
              {discount > 0 && <Row label={`Discount (${appliedCoupon})`} value={`- ${inr(discount)}`} green />}
              <Row label="Delivery" value={delivery === 0 ? "FREE" : inr(delivery)} green={delivery === 0} />
              <div className="my-2 border-t border-border" />
              <Row label="Total" value={inr(total)} bold />
            </div>
            <Button onClick={placeOrder} disabled={placing} data-testid="checkout-place-order-button" className="w-full rounded-xl bg-brand py-6 font-semibold text-white hover:bg-brand-dark">
              {placing ? "Placing order..." : method === "cod" ? "Place Order" : `Pay ${inr(total)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, v, set, testid }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input value={v} onChange={(e) => set(e.target.value)} className="mt-1" data-testid={testid} />
    </div>
  );
}
function Row({ label, value, bold, green }) {
  return (
    <div className={`flex justify-between py-1 ${bold ? "font-heading text-lg font-bold text-slate-900" : "text-slate-600"}`}>
      <span>{label}</span><span className={green ? "font-semibold text-trust" : ""}>{value}</span>
    </div>
  );
}
