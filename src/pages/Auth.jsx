import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { apiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success("Welcome back!");
      const dest = location.state?.from || (u.role === "admin" ? "/admin" : u.role === "seller" ? "/seller" : "/");
      navigate(dest);
    } catch (err) { toast.error(apiError(err)); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell title="Welcome back" sub="Login to your HFSBAG account">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" data-testid="login-email" />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1" data-testid="login-password" />
        </div>
        <Button type="submit" disabled={loading} data-testid="login-submit" className="w-full rounded-xl bg-brand py-6 font-semibold text-white hover:bg-brand-dark">
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        New to HFSBAG? <Link to="/register" className="font-semibold text-brand-dark hover:underline">Create account</Link>
      </p>
      <div className="mt-4 rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
        <b>Demo:</b> customer@demo.com / Customer@123 · Seller: royalstorage@demo.com / Seller@123
      </div>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, role: "customer" });
      toast.success("Account created!");
      navigate("/");
    } catch (err) { toast.error(apiError(err)); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell title="Create your account" sub="Join HFSBAG and start shopping">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full Name" v={form.name} set={(v) => setForm({ ...form, name: v })} testid="reg-name" />
        <Field label="Email" type="email" v={form.email} set={(v) => setForm({ ...form, email: v })} testid="reg-email" />
        <Field label="Phone" v={form.phone} set={(v) => setForm({ ...form, phone: v })} testid="reg-phone" />
        <Field label="Password" type="password" v={form.password} set={(v) => setForm({ ...form, password: v })} testid="reg-password" />
        <Button type="submit" disabled={loading} data-testid="register-submit" className="w-full rounded-xl bg-brand py-6 font-semibold text-white hover:bg-brand-dark">
          {loading ? "Creating..." : "Create Account"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="font-semibold text-brand-dark hover:underline">Login</Link>
      </p>
    </AuthShell>
  );
}

export function SellerRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", store_name: "", store_description: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, role: "seller" });
      toast.success("Seller account created! Your account is pending admin approval.");
      navigate("/seller");
    } catch (err) { toast.error(apiError(err)); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell title="Become a Seller" sub="Start selling on HFSBAG marketplace" wide>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Your Name" v={form.name} set={(v) => setForm({ ...form, name: v })} testid="sreg-name" />
        <Field label="Email" type="email" v={form.email} set={(v) => setForm({ ...form, email: v })} testid="sreg-email" />
        <Field label="Phone" v={form.phone} set={(v) => setForm({ ...form, phone: v })} testid="sreg-phone" />
        <Field label="Password" type="password" v={form.password} set={(v) => setForm({ ...form, password: v })} testid="sreg-password" />
        <Field label="Store Name" v={form.store_name} set={(v) => setForm({ ...form, store_name: v })} testid="sreg-store" />
        <Field label="Store Description" v={form.store_description} set={(v) => setForm({ ...form, store_description: v })} testid="sreg-desc" />
        <div className="sm:col-span-2">
          <Button type="submit" disabled={loading} data-testid="seller-register-submit" className="w-full rounded-xl bg-brand py-6 font-semibold text-white hover:bg-brand-dark">
            {loading ? "Creating..." : "Create Seller Account"}
          </Button>
        </div>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already a seller? <Link to="/login" className="font-semibold text-brand-dark hover:underline">Login</Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({ title, sub, children, wide }) {
  return (
    <div className="mx-auto grid min-h-[80vh] max-w-7xl place-items-center px-4 py-10">
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-3xl border border-border bg-card p-8 shadow-sm`}>
        <div className="mb-6 text-center">
          <Link to="/" className="font-heading text-2xl font-extrabold"><span className="text-brand">HFS</span>BAG</Link>
          <h1 className="mt-3 font-heading text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-muted-foreground">{sub}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({ label, v, set, type = "text", testid }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={v} onChange={(e) => set(e.target.value)} required className="mt-1" data-testid={testid} />
    </div>
  );
}
