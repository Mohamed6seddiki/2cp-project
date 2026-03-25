import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login, getHomePath } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(getHomePath(), { replace: true });
    } catch (err) {
      const rawMessage = err?.message ?? '';
      if (rawMessage.toLowerCase().includes('email not confirmed')) {
        setError('Your account is not confirmed yet. Please open your email and confirm your account first.');
      } else {
        setError(rawMessage || 'Unable to login. Please verify your credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2">Login</h1>
        <p className="text-text-muted mb-6 text-sm">Access your learning dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            required
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-sm text-text-muted mt-6">
          No account?{' '}
          <Link to="/register" className="text-primary hover:text-primary-hover">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
