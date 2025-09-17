import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Star, Zap, Crown, Users, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { TrialModal } from '../components/ui/TrialModal';
import { stripeProducts } from '../stripe-config';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);
  const [trialModal, setTrialModal] = useState<{ isOpen: boolean; product: any }>({
    isOpen: false,
    product: null,
  });

  const handlePurchase = async (priceId: string, productName: string) => {
    try {
      setLoading(priceId);
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to login if not authenticated
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        setLoading(null);
        return;
      }
      
      if (authError) {
        console.error('Auth error:', authError);
        toast.error('Authentication error. Please sign in again.');
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        setLoading(null);
        return;
      }

      // Determine mode based on product
      const product = stripeProducts.find(p => p.priceId === priceId);
      const mode = product?.mode || 'subscription';

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        toast.error('Configuration error. Please contact support.');
        setLoading(null);
        return;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/dashboard?success=true&product=${encodeURIComponent(productName)}`,
          cancel_url: `${window.location.origin}/pricing?canceled=true`,
          mode,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        toast.error(error);
        setLoading(null);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setLoading(null);
      toast.error('Failed to initiate purchase');
    }
  };

  const handleGetStarted = (product: any) => {
    if (product.price === 0) {
      // Free plan - direct signup
      handlePurchase(product.priceId, product.name);
    } else if (product.trialDays && product.trialDays > 0) {
      // Show trial modal for subscription plans
      setTrialModal({ isOpen: true, product });
    } else {
      // One-time payment plans
      handlePurchase(product.priceId, product.name);
    }
  };

  const handleStartTrial = async (priceId: string, productName: string) => {
    setTrialModal({ isOpen: false, product: null });
    await handlePurchase(priceId, productName);
  };

  const tierIcons = {
    'Loner': Heart,
    'Starter Tribe': Star,
    'Pro Tribe': Zap,
    'Team Tribe': Users,
  };

  // Group products by name and sort by price
  const groupedProducts = stripeProducts.reduce((acc, product) => {
    if (!acc[product.name]) {
      acc[product.name] = [];
    }
    acc[product.name].push(product);
    return acc;
  }, {} as Record<string, typeof stripeProducts>);

  // Sort each group by price and get the cheapest option for display
  const displayProducts = Object.entries(groupedProducts).map(([name, products]) => {
    const sortedProducts = products.sort((a, b) => a.price - b.price);
    const cheapest = sortedProducts[0];
    const mostExpensive = sortedProducts[sortedProducts.length - 1];
    
    return {
      ...cheapest,
      alternatives: sortedProducts.length > 1 ? sortedProducts.slice(1) : [],
      hasDiscount: sortedProducts.length > 1,
      originalPrice: mostExpensive.price,
    };
  });

  const getDiscountPercentage = (originalPrice: number, currentPrice: number) => {
    if (currentPrice === 0 || originalPrice === currentPrice) return null;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const isPopular = (name: string) => name === 'Pro Tribe' || name === 'Team Tribe';

  return (
    <Layout>
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Choose Your Perfect Plan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Unlock the full potential of Taskora with our carefully crafted plans designed for every need.
          </motion.p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {displayProducts.map((product, index) => {
            const Icon = tierIcons[product.name as keyof typeof tierIcons] || Star;
            const discount = product.hasDiscount ? getDiscountPercentage(product.originalPrice, product.price) : null;
            const popular = isPopular(product.name);
            const isLifetime = product.price > 500;
            const isLoading = loading === product.priceId;
            const isTeamTribe = product.name === 'Team Tribe' && product.price === 59.99;
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Limited Time Offer Badge */}
                {isLifetime && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gray-900 text-white px-4 py-1 rounded-full text-xs font-medium">
                      LIMITED TIME OFFER ONLY
                    </div>
                  </div>
                )}

                {/* Popular/Best Badge */}
                {(popular || isTeamTribe) && !isLifetime && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-medium">
                      {isTeamTribe ? 'BEST FOR LARGE TEAMS' : 'MOST POPULAR'}
                    </div>
                  </div>
                )}
                
                <div className={`
                  bg-white rounded-lg border-2 p-6 h-full flex flex-col relative
                  ${(popular || isTeamTribe) ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-200 shadow-lg'}
                  ${isLifetime ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-300' : ''}
                  hover:shadow-xl transition-all duration-300
                `}>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Icon className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {isTeamTribe ? `${product.name} (€${product.price}/month)` : product.name}
                      </h3>
                    </div>
                    
                    {isLifetime && (
                      <div className="inline-flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium mb-2">
                        <Crown className="w-3 h-3" />
                        <span>LIFETIME</span>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600">{product.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-6">
                    {/* Original Price & Discount */}
                    {discount && discount > 0 && (
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <span className="text-sm text-gray-500 line-through">€{product.originalPrice}</span>
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                          Save {discount}%
                        </span>
                      </div>
                    )}
                    
                    {/* Current Price */}
                    <div className="flex items-baseline justify-center space-x-1">
                      <span className="text-3xl font-bold text-gray-900">
                        €{product.price}
                      </span>
                      <span className="text-gray-600 text-sm">
                        {product.price === 0 ? '' : product.mode === 'payment' ? '/Once' : '/Month'}
                      </span>
                    </div>
                  </div>

                  {/* Money Back Guarantee */}
                  <div className="flex items-center justify-center space-x-1 text-blue-600 text-xs mb-6">
                    <Shield className="w-3 h-3" />
                    <span>60 Days Money Back Guarantee</span>
                  </div>

                  {/* Buy Button */}
                  <div className="mb-6">
                    <Button
                      onClick={() => handleGetStarted(product)}
                      className={`w-full py-3 ${
                        popular || isLifetime || isTeamTribe
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-white border-2 border-red-500 text-red-500 hover:bg-red-50'
                      }`}
                      disabled={product.price === 0}
                      loading={isLoading}
                    >
                      {product.price === 0 
                        ? 'Get Started Free' 
                        : product.trialDays && product.trialDays > 0 
                          ? `Start ${product.trialDays}-Day Free Trial`
                          : 'Get Started'
                      }
                    </Button>
                  </div>

                  <div className="flex-1">
                    <ul className="space-y-3">
                      {product.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white/50 rounded-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 text-sm">
                All paid plans come with a 60-day money-back guarantee. No questions asked.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trial Modal */}
      <TrialModal
        isOpen={trialModal.isOpen}
        onClose={() => setTrialModal({ isOpen: false, product: null })}
        product={trialModal.product}
        onStartTrial={handleStartTrial}
        loading={loading !== null}
      />
    </Layout>
  );
};