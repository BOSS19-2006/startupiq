import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Gauge } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { apiErrorMessage } from '../services/api.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.confirmPassword);
      toast.success('Account created. Welcome to StartupIQ!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to create account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 py-12">
      <Link to="/" className="mx-auto mb-6 flex items-center gap-2 font-display text-lg font-bold text-ink-900">
        <Gauge className="h-6 w-6 text-brand" /> StartupIQ
      </Link>
      <h1 className="text-center font-display text-2xl font-bold text-ink-900">Create your account</h1>
      <p className="mt-2 text-center text-sm text-ink-500">Start validating your startup idea in minutes.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <Input id="name" label="Full name" required autoComplete="name"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input id="email" type="email" label="Email" required autoComplete="email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <div className="relative">
          <Input id="password" type={showPassword ? 'text' : 'password'} label="Password" required autoComplete="new-password"
            hint="At least 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="button" onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-9 text-ink-500" aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>
        <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} label="Confirm password" required autoComplete="new-password"
          value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
        <Button type="submit" loading={loading} className="w-full">Create account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account? <Link to="/login" className="font-semibold text-brand">Log in</Link>
      </p>
    </div>
  );
}
