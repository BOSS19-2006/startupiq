import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Gauge } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { apiErrorMessage } from '../services/api.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}.`);
      const dest = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to log in.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 py-12">
      <Link to="/" className="mx-auto mb-6 flex items-center gap-2 font-display text-lg font-bold text-ink-900">
        <Gauge className="h-6 w-6 text-brand" /> StartupIQ
      </Link>
      <h1 className="text-center font-display text-2xl font-bold text-ink-900">Log in to your account</h1>
      <p className="mt-2 text-center text-sm text-ink-500">Continue validating your startup ideas.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <Input id="email" type="email" label="Email" required autoComplete="email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <div className="relative">
          <Input id="password" type={showPassword ? 'text' : 'password'} label="Password" required autoComplete="current-password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="button" onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-9 text-ink-500" aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>
        <Button type="submit" loading={loading} className="w-full">Log in</Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Don't have an account? <Link to="/register" className="font-semibold text-brand">Sign up</Link>
      </p>
    </div>
  );
}
