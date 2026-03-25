import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    await login(email, password);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>
      
      <Card className="w-full max-w-md p-8 relative overflow-hidden shadow-glow">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-text-muted text-sm">Log in to continue your learning journey.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
               <Mail size={18} />
             </div>
             <Input 
               type="email" 
               placeholder="name@example.com" 
               className="pl-10 h-11"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
             />
          </div>

          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
               <Lock size={18} />
             </div>
             <Input 
               type="password" 
               placeholder="••••••••" 
               className="pl-10 h-11"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
             />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-border bg-background text-primary focus:ring-primary/50 w-4 h-4 cursor-pointer" />
              <span className="text-text-muted">Remember me</span>
            </label>
            <a href="#" className="text-primary hover:text-primary-hover transition-colors font-medium">Forgot password?</a>
          </div>

          <Button type="submit" fullWidth className="mt-6 h-11 font-bold gap-2 text-base">
            <LogIn size={20} /> Sign In
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-text-muted border-t border-border pt-6">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary hover:text-primary-hover font-bold transition-colors">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
