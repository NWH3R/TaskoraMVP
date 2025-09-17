import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  skew?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  skew = false,
}) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      className={`
        bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-md shadow-lg
        ${skew ? 'transform -skew-y-1 hover:skew-y-0' : ''}
        transition-all duration-300
        ${className}
      `}
      style={{
        clipPath: skew ? 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' : undefined,
      }}
    >
      <div className={skew ? 'transform skew-y-1' : ''}>
        {children}
      </div>
    </motion.div>
  );
};