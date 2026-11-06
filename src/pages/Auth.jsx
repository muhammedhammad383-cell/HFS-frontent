import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api, { apiError } from "@/lib/api";
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
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState(1);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success("Welcome back!");
      const dest = location.state?.from || (u.role === "admin" ? "/admin" : "/");
      navigate(dest);
    } catch (err) { toast.error(apiError(err)); }
    finally { setLoading(false); }
  };
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: forgotEmail });
      toast.success("OTP aapke email par bhej diya gaya hai!");
      setForgotStep(2);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: forgotEmail,
        otp: forgotOtp,
        new_password: newPassword,
      });
      toast.success("Password reset ho gaya! Ab naye password se login karein.");
      setShowForgot(false);
      setForgotStep(1);
      setForgotEmail("");
      setForgotOtp("");
      setNewPassword("");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };
    if (showForgot) {
    return (
      <AuthShell title="Reset Password" sub="Apna email darj karein password reset karne ke liye">
        {forgotStep === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <Label>Registered Email</Label>
              <Input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="text-xs text-muted-foreground hover:underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label>Enter 6-digit OTP</Label>
              <Input
                type="text"
                required
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value)}
                placeholder="123456"
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Resetting..." : "Set New Password"}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setForgotStep(1)}
                className="text-xs text-muted-foreground hover:underline"
              >
                Change Email
              </button>
            </div>
          </form>
        )}
      </AuthShell>
    );
    }
  
  return (
    <AuthShell title="Welcome back" sub="Login to your HFS BAZAAR account">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" data-testid="login-email" />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1" data-testid="login-password" />
        </div>
        <div className="flex justify-end">
  <button
    type="button"
    onClick={() => setShowForgot(true)}
    className="text-xs text-orange-600 hover:underline"
  >
    Forgot Password?
  </button>
</div>
        
        <Button type="submit" disabled={loading} data-testid="login-submit" className="w-full rounded-xl bg-brand py-6 font-semibold text-white hover:bg-brand-dark">
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <GoogleAuthButton onSuccess={(u) => navigate(location.state?.from || (u.role === "admin" ? "/admin" : "/"))} />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        New to HFS BAZAAR? <Link to="/register" className="font-semibold text-brand-dark hover:underline">Create account</Link>
      </p>
      
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
    <AuthShell title="Create your account" sub="Join HFS and start shopping">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full Name" v={form.name} set={(v) => setForm({ ...form, name: v })} testid="reg-name" />
        <Field label="Email" type="email" v={form.email} set={(v) => setForm({ ...form, email: v })} testid="reg-email" />
        <Field label="Phone" v={form.phone} set={(v) => setForm({ ...form, phone: v })} testid="reg-phone" />
        <Field label="Password" type="password" v={form.password} set={(v) => setForm({ ...form, password: v })} testid="reg-password" />
        <Button type="submit" disabled={loading} data-testid="register-submit" className="w-full rounded-xl bg-brand py-6 font-semibold text-white hover:bg-brand-dark">
          {loading ? "Creating..." : "Create Account"}
        </Button>
      </form>
      <GoogleAuthButton onSuccess={() => navigate("/")} />
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
    <AuthShell title="Become a Seller" sub="Start selling on HFS marketplace" wide>
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
          <Link to="/" className="font-heading text-2xl font-extrabold"><span className="text-brand">HFS</span> BAZAAR</Link>
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


function GoogleAuthButton({ onSuccess }) {
  const { googleLogin } = useAuth();
  const [busy, setBusy] = useState(false);
  const [showQuickGoogle, setShowQuickGoogle] = useState(false);
  const [gEmail, setGEmail] = useState("");
  const [gName, setGName] = useState("");

  const handleGoogleClick = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "318002719665-0vpjensp1ditvul67rf39k8oteknrhvd.apps.googleusercontent.com";
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            setBusy(true);
            try {
              const u = await googleLogin({ access_token: tokenResponse.access_token });
              toast.success("Welcome! Logged in with Google");
              if (onSuccess) onSuccess(u);
            } catch (err) {
              toast.error(apiError(err));
            } finally {
              setBusy(false);
            }
          }
        },
      });
      tokenClient.requestAccessToken({ prompt: "select_account" });
    } else if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setBusy(true);
          try {
            const u = await googleLogin({ credential: response.credential });
            toast.success("Welcome! Logged in with Google");
            if (onSuccess) onSuccess(u);
          } catch (err) {
            toast.error(apiError(err));
          } finally {
            setBusy(false);
          }
        },
      });
      window.google.accounts.id.prompt();
    } else {
      toast.error("Google Sign-In is loading, please tap again in 2 seconds.");
    }
  };

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    if (!gEmail || !gEmail.includes("@")) return toast.error("Please enter your Gmail address");
    setBusy(true);
    try {
      const u = await googleLogin({ email: gEmail, name: gName || gEmail.split("@")[0] });
      toast.success("Welcome! Logged in with Google");
      setShowQuickGoogle(false);
      if (onSuccess) onSuccess(u);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="relative my-4 flex items-center justify-center">
        <div className="border-t border-border w-full"></div>
        <span className="bg-card px-3 text-xs text-muted-foreground uppercase">OR</span>
        <div className="border-t border-border w-full"></div>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={handleGoogleClick}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"/>
          <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"/>
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"/>
        </svg>
        {busy ? "Signing in with Google..." : "Continue with Google"}
      </button>

      {showQuickGoogle && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 space-y-2.5">
          <p className="text-xs font-semibold text-slate-800">Enter your Google (Gmail) account for instant sign-in:</p>
          <input
            type="text"
            placeholder="Your Name (optional)"
            value={gName}
            onChange={(e) => setGName(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs"
          />
          <input
            type="email"
            placeholder="yourname@gmail.com"
            value={gEmail}
            onChange={(e) => setGEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowQuickGoogle(false)} className="rounded-lg px-3 py-1.5 text-xs text-slate-600">Cancel</button>
            <button type="button" onClick={handleQuickSubmit} disabled={busy} className="rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-white">Continue</button>
          </div>
        </div>
      )}
    </div>
  );
}
