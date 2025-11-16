
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically validate credentials
    login();
    navigate('/');
  };

  return (
    <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className="min-h-screen flex flex-col justify-center items-center p-6"
    >
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold font-poppins text-text-primary mb-2">Login to Continue</h1>
        <p className="text-text-secondary mb-8">Welcome back!</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <Input label="Email Address" id="email" type="email" placeholder="you@example.com" required />
          <Input label="Password" id="password" type="password" placeholder="••••••••" required />
          <Button type="submit">Login</Button>
        </form>

        <p className="mt-4 text-sm text-text-secondary">
          <a href="#" className="font-medium text-primary hover:underline">Forgot Password?</a>
        </p>
        
        <p className="mt-8 text-sm text-text-secondary">
          New user?{' '}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginScreen;
