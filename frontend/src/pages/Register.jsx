import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const navigate = useNavigate();
  const { register, getHomePath } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const authResult = await register(email, password, username);

      if (!authResult?.session) {
        setSuccessMessage('Account created. Please confirm your email, then login.');
        return;
      }

      navigate(getHomePath(), { replace: true });
    } catch (err) {
      const rawMessage = err?.message ?? 'Unable to register. Please try again.';
      if (rawMessage.includes('Database error saving new user')) {
        setError('Registration failed on database trigger. Try a different username, or check Supabase trigger/logs.');
      } else {
        setError(rawMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2">Register</h1>
        <p className="text-text-muted mb-6 text-sm">Create your Supabase-backed account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
            required
          />
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
          {successMessage && <p className="text-sm text-success">{successMessage}</p>}
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="text-sm text-text-muted mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-primary hover:text-primary-hover">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
