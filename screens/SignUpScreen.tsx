
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

const SignUpScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate signup and auto-login
    login();
    // In a real app, the user would be redirected to firm setup
    navigate('/');
  };

  return (
    <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="min-h-screen flex flex-col justify-center items-center p-6"
    >
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold font-poppins text-text-primary mb-2">Create Account</h1>
        <p className="text-text-secondary mb-8">Start tracking your business today.</p>
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <Input label="Full Name" id="fullname" type="text" placeholder="John Doe" required />
          <Input label="Email Address" id="email" type="email" placeholder="you@example.com" required />
          <Input label="Password" id="password" type="password" placeholder="••••••••" required />
          <Input label="Confirm Password" id="confirm-password" type="password" placeholder="••••••••" required />
          <div className="pt-4">
            <Button type="submit">Sign Up</Button>
          </div>
        </form>
        
        <p className="mt-8 text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default SignUpScreen;
