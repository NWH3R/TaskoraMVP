import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getProductByPriceId } from '../stripe-config';

interface SubscriptionData {
  subscription_id: string | null;
  price_id: string | null;
  status: string;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        setSubscription(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const getActivePlan = () => {
    if (!subscription || !subscription.price_id) {
      return { name: 'Free', status: 'active' };
    }

    const product = getProductByPriceId(subscription.price_id);
    return {
      name: product?.name || 'Unknown Plan',
      status: subscription.status,
      product,
    };
  };

  return {
    subscription,
    loading,
    error,
    activePlan: getActivePlan(),
  };
};