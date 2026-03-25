import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    await register(email, password, name);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-tertiary/5 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>
      
      <Card className="w-full max-w-md p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tertiary to-primary"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
          <p className="text-text-muted text-sm">Start your algorithmic learning journey today.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
               <User size={18} />
             </div>
             <Input 
               type="text" 
               placeholder="Full Name" 
               className="pl-10"
               value={name}
               onChange={(e) => setName(e.target.value)}
               required
             />
          </div>

          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
               <Mail size={18} />
             </div>
             <Input 
               type="email" 
               placeholder="name@example.com" 
               className="pl-10"
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
               placeholder="Password" 
               className="pl-10"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
             />
          </div>

          <Button type="submit" fullWidth className="mt-6 gap-2">
            <UserPlus size={18} /> Create Account
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-text-muted border-t border-border pt-6">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
            Log in here
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
