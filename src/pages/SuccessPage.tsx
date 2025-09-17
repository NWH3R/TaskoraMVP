import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Download, Mail } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const productName = searchParams.get('product');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            
            {productName && (
              <p className="text-lg text-gray-600 mb-6">
                Thank you for purchasing <strong>{decodeURIComponent(productName)}</strong>. 
                Your account has been upgraded and you now have access to all the premium features.
              </p>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h2>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Check your email for the receipt and welcome guide</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Download our mobile app for on-the-go productivity</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ArrowRight className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Start creating your first tribe and invite team members</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              
              <Link to="/tribes">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Create Your First Tribe
                </Button>
              </Link>
            </div>

            {/* Auto Redirect Notice */}
            {countdown > 0 && (
              <p className="text-sm text-gray-500 mt-6">
                Redirecting to dashboard in {countdown} seconds...
              </p>
            )}
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};