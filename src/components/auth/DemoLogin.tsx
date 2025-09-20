import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface DemoLoginProps {
  onSuccess?: () => void;
}

export const DemoLogin: React.FC<DemoLoginProps> = ({ onSuccess }) => {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await signIn('demo@taskora.eu', 'demo1234');
      toast.success('Welcome to the Taskora demo!');
      onSuccess?.();
    } catch (error) {
      toast.error('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleDemoLogin}
      loading={loading}
      className="px-8 py-4 text-lg"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <Play className="w-5 h-5 mr-2" />
      )}
      Try Demo
    </Button>
  );
};