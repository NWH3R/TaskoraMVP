import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, CheckCircle, Star } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { StripeProduct } from '../../types';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: StripeProduct;
  onStartTrial: (priceId: string, productName: string) => void;
  loading?: boolean;
}

export const TrialModal: React.FC<TrialModalProps> = ({
  isOpen,
  onClose,
  product,
  onStartTrial,
  loading = false,
}) => {
  const trialBenefits = [
    'Full access to all features',
    'No credit card required',
    'Cancel anytime during trial',
    'Seamless upgrade after trial',
    'Priority customer support',
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center">
        {/* Header */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md mx-auto mb-4 flex items-center justify-center">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Start Your Free Trial
          </h2>
          <p className="text-gray-600">
            Try <strong>{product.name}</strong> free for {product.trialDays} days
          </p>
        </div>

        {/* Trial Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-md p-6 mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">
              {product.trialDays} Days Free Trial
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            After your trial ends, you'll be charged €{product.price}/{product.mode === 'subscription' ? 'month' : 'once'}
          </p>
          
          {/* Benefits */}
          <div className="space-y-2">
            {trialBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Preview */}
        <div className="text-left mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">What's included:</h3>
          <div className="grid grid-cols-1 gap-2">
            {product.features.slice(0, 4).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
            {product.features.length > 4 && (
              <div className="text-sm text-gray-500 mt-1">
                + {product.features.length - 4} more features
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Maybe Later
          </Button>
          <Button
            onClick={() => onStartTrial(product.priceId, product.name)}
            loading={loading}
            className="flex-1"
          >
            Start Free Trial
          </Button>
        </div>

        {/* Fine Print */}
        <p className="text-xs text-gray-500 mt-4">
          No credit card required. Cancel anytime during your trial period.
        </p>
      </div>
    </Modal>
  );
};